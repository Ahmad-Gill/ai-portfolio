import hmac
import json
import os
import re
import sqlite3
import traceback
from datetime import datetime, timezone

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .views import VISITOR_DB_PATH, VISITOR_ID_PATTERN


# --- App reviews ---
# Stored in the same SQLite file as the visitor counter (backend/data/, kept
# across deployments). A review and its rating are one row, so deleting the
# review also removes its rating from every average.

REVIEWS_ADMIN_PASSWORD = os.getenv("REVIEWS_ADMIN_PASSWORD")

# Matches the `id` of an app in frontend/src/data/apps.js.
APP_ID_PATTERN = re.compile(r"^[a-z0-9-]{1,64}$")

MAX_NAME_LENGTH = 40
MAX_COMMENT_LENGTH = 1000


def get_connection():
    VISITOR_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(VISITOR_DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS app_reviews (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            app_id     TEXT NOT NULL,
            visitor_id TEXT NOT NULL,
            name       TEXT NOT NULL,
            rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment    TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE (app_id, visitor_id)
        )
    """)
    return conn


def summarize(rows):
    """Average, count and 1-5 star distribution for a list of reviews."""
    distribution = {str(star): 0 for star in range(1, 6)}
    for row in rows:
        distribution[str(row["rating"])] += 1

    count = len(rows)
    average = round(sum(row["rating"] for row in rows) / count, 2) if count else 0
    return {"average": average, "count": count, "distribution": distribution}


def build_payload(conn, visitor_id=None):
    rows = conn.execute("SELECT * FROM app_reviews ORDER BY created_at DESC, id DESC").fetchall()

    by_app = {}
    for row in rows:
        by_app.setdefault(row["app_id"], []).append(row)

    # visitor_id is never sent back; `mine` tells the browser which reviews it can delete.
    reviews = [
        {
            "id": row["id"],
            "app_id": row["app_id"],
            "name": row["name"],
            "rating": row["rating"],
            "comment": row["comment"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
            "mine": bool(visitor_id) and row["visitor_id"] == visitor_id,
        }
        for row in rows
    ]

    return {
        "success": True,
        "overall": {**summarize(rows), "apps_rated": len(by_app)},
        "apps": {app_id: summarize(app_rows) for app_id, app_rows in by_app.items()},
        "reviews": reviews,
    }


def is_admin(request):
    password = request.headers.get("X-Reviews-Password", "")
    return bool(REVIEWS_ADMIN_PASSWORD) and hmac.compare_digest(password, REVIEWS_ADMIN_PASSWORD)


def valid_visitor_id(value):
    return isinstance(value, str) and VISITOR_ID_PATTERN.match(value)


@csrf_exempt
def reviews_view(request):
    """
    GET  ?visitor_id=...  -> every review plus per-app and overall ratings.
    POST {"app_id", "visitor_id", "name", "rating", "comment"} -> adds the review,
         or replaces this browser's earlier review of the same app.
    """
    if request.method == "GET":
        visitor_id = request.GET.get("visitor_id")
        try:
            with get_connection() as conn:
                return JsonResponse(build_payload(conn, visitor_id if valid_visitor_id(visitor_id) else None))
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Only GET and POST requests allowed."}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON payload."}, status=400)

    app_id = data.get("app_id")
    visitor_id = data.get("visitor_id")
    name = str(data.get("name", "")).strip()
    comment = str(data.get("comment", "")).strip()
    rating = data.get("rating")

    if not isinstance(app_id, str) or not APP_ID_PATTERN.match(app_id):
        return JsonResponse({"success": False, "error": "A valid app_id is required."}, status=400)
    if not valid_visitor_id(visitor_id):
        return JsonResponse({"success": False, "error": "A valid visitor_id is required."}, status=400)
    if not isinstance(rating, int) or isinstance(rating, bool) or not 1 <= rating <= 5:
        return JsonResponse({"success": False, "error": "Rating must be a whole number from 1 to 5."}, status=400)
    if not name or len(name) > MAX_NAME_LENGTH:
        return JsonResponse({"success": False, "error": f"Name is required (max {MAX_NAME_LENGTH} characters)."}, status=400)
    if not comment or len(comment) > MAX_COMMENT_LENGTH:
        return JsonResponse({"success": False, "error": f"Review is required (max {MAX_COMMENT_LENGTH} characters)."}, status=400)

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    try:
        with get_connection() as conn:
            conn.execute(
                """
                INSERT INTO app_reviews (app_id, visitor_id, name, rating, comment, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (app_id, visitor_id) DO UPDATE SET
                    name = excluded.name,
                    rating = excluded.rating,
                    comment = excluded.comment,
                    updated_at = excluded.updated_at
                """,
                (app_id, visitor_id, name, rating, comment, now, now),
            )
            return JsonResponse(build_payload(conn, visitor_id))
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def review_detail_view(request, review_id):
    """
    DELETE removes a review (and its rating). Allowed for the browser that wrote it
    (?visitor_id=...) or for the site owner (X-Reviews-Password header).
    """
    if request.method != "DELETE":
        return JsonResponse({"success": False, "error": "Only DELETE requests allowed."}, status=405)

    visitor_id = request.GET.get("visitor_id")
    admin = is_admin(request)

    if request.headers.get("X-Reviews-Password") and not admin:
        return JsonResponse({"success": False, "error": "Invalid admin password."}, status=401)

    try:
        with get_connection() as conn:
            row = conn.execute("SELECT visitor_id FROM app_reviews WHERE id = ?", (review_id,)).fetchone()
            if not row:
                return JsonResponse({"success": False, "error": "Review not found."}, status=404)

            if not admin and not (valid_visitor_id(visitor_id) and row["visitor_id"] == visitor_id):
                return JsonResponse({"success": False, "error": "You can only delete your own review."}, status=403)

            conn.execute("DELETE FROM app_reviews WHERE id = ?", (review_id,))
            return JsonResponse(build_payload(conn, visitor_id if valid_visitor_id(visitor_id) else None))
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def reviews_admin_check_view(request):
    """POST with the X-Reviews-Password header; tells the frontend whether the password is right."""
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Only POST requests allowed."}, status=405)

    if not REVIEWS_ADMIN_PASSWORD:
        return JsonResponse({"success": False, "error": "Admin password is not configured."}, status=500)

    if not is_admin(request):
        return JsonResponse({"success": False, "error": "Invalid admin password."}, status=401)

    return JsonResponse({"success": True})
