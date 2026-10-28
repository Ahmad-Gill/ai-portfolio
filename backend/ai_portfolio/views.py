import json
import os
import io
import tempfile
import traceback
import subprocess
import shutil
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from django.http import JsonResponse, HttpResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from pydub import AudioSegment

from ai_portfolio.amazing_AI_projects.imageToPdf import image_to_pdf
from .amazing_AI_projects.textToSpeech import generate_voice
from .amazing_AI_projects.mythBuster import mythbuster_answer
from .amazing_AI_projects.translator import translate_and_correct  
from .amazing_AI_projects.painting_generator1 import generate_meaningful_abstract_painting
from .amazing_AI_projects.painting_generator2 import generate_meaningful_abstract_painting1
from .amazing_AI_projects.painting_generator3 import generate_abstract_painting_with_faces
from .amazing_AI_projects.painting_generator4 import generate_abstract_painting

from .docmind.config import (
    DOCMIND_UPLOAD_PASSWORD,
    SUPPORTED_DOCUMENT_EXTENSIONS,
)
from .docmind.rag import (
    create_embeddings,
    generate_answer,
)

os.environ["COQUI_TOS_AGREED"] = "1"

# Automatically resolve system paths for FFmpeg and FFprobe
FFMPEG_PATH = os.environ.get("FFMPEG_PATH") or shutil.which("ffmpeg") or "/usr/bin/ffmpeg"
FFPROBE_PATH = os.environ.get("FFPROBE_PATH") or shutil.which("ffprobe") or "/usr/bin/ffprobe"

AudioSegment.converter = FFMPEG_PATH
AudioSegment.ffprobe = FFPROBE_PATH

# Safe check that won't crash WSGI startup if missing
try:
    subprocess.run([FFPROBE_PATH, "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
except Exception as e:
    print(f"Warning: ffprobe verification failed at {FFPROBE_PATH}: {e}")


# --- Views ---

@csrf_exempt
def check_claim(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed."}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
        claim = data.get("claim", "").strip()
        if not claim:
            return JsonResponse({"error": "Claim text is required."}, status=400)

        result = mythbuster_answer(claim)
        return JsonResponse(result, safe=False)

    except json.JSONDecodeError as e:
        return JsonResponse({"error": "Invalid JSON payload.", "details": str(e)}, status=400)

    except Exception as e:
        tb = traceback.format_exc()
        print("Error in check_claim:\n", tb)
        return JsonResponse({
            "error": "Internal Server Error",
            "message": str(e),
            "traceback": tb
        }, status=500)


@csrf_exempt
def translate_text(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed."}, status=405)

    try:
        if request.content_type != "application/json":
            return JsonResponse({"error": "Content-Type must be application/json"}, status=400)

        data = json.loads(request.body.decode("utf-8"))
        text = data.get("text", "").strip()
        language = data.get("language", "").strip()

        if not text or not language:
            return JsonResponse({"error": "Both 'text' and 'language' are required."}, status=400)

        result = translate_and_correct(text, language)
        return JsonResponse(result)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload."}, status=400)
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)


def painting_view1(request):
    image = generate_meaningful_abstract_painting(1280, 720)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")


def painting_view2(request):
    image = generate_meaningful_abstract_painting1(1280, 720)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")


def painting_faces_view(request):
    img = generate_abstract_painting_with_faces(1280, 720)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")


def abstract_painting_view(request):
    painting = generate_abstract_painting(1280, 720)
    img_io = io.BytesIO()
    painting.save(img_io, format="PNG")
    img_io.seek(0)
    return HttpResponse(img_io, content_type="image/png")


@csrf_exempt
def text_to_speech_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed."}, status=405)

    temp_wav = None

    try:
        text = request.POST.get("text")
        audio_file = request.FILES.get("audio")

        if not text:
            return JsonResponse({"error": "Text is required."}, status=400)

        if not audio_file:
            return JsonResponse({"error": "Speaker audio is required."}, status=400)

        audio = AudioSegment.from_file(audio_file)

        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        temp_wav = temp.name
        temp.close()

        audio.export(temp_wav, format="wav")

        output_path = generate_voice(
            text=text,
            speaker_wav=temp_wav,
            language="en"
        )

        audio_url = request.build_absolute_uri(
            "/media/tts/" + os.path.basename(output_path)
        )

        return JsonResponse({"audio": audio_url})

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)

    finally:
        if temp_wav and os.path.exists(temp_wav):
            os.remove(temp_wav)


@csrf_exempt
def image_to_pdf_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed."}, status=405)

    image = request.FILES.get("image")

    if not image:
        return JsonResponse({"error": "Image is required."}, status=400)

    try:
        pdf_path = image_to_pdf(image)
        pdf_url = request.build_absolute_uri(
            "/media/pdfs/" + os.path.basename(pdf_path)
        )
        return JsonResponse({"pdf": pdf_url})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def docmind_upload_document(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Only POST requests allowed."}, status=405)

    try:
        password = request.headers.get("X-DocMind-Password")

        if not DOCMIND_UPLOAD_PASSWORD:
            return JsonResponse({"success": False, "error": "Upload password is not configured."}, status=500)

        if not password:
            return JsonResponse({"success": False, "error": "Authentication password is required."}, status=401)

        if password != DOCMIND_UPLOAD_PASSWORD:
            return JsonResponse({"success": False, "error": "Invalid authentication password."}, status=401)

        document = request.FILES.get("document")

        if not document:
            return JsonResponse({"success": False, "error": "Document is required."}, status=400)

        file_name = document.name
        extension = os.path.splitext(file_name)[1].lower()

        if extension not in SUPPORTED_DOCUMENT_EXTENSIONS:
            return JsonResponse({
                "success": False,
                "error": "Unsupported document type. Allowed: PDF, DOCX, TXT."
            }, status=400)

        temp_file_path = None

        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
                for chunk in document.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            chunk_count = create_embeddings(temp_file_path, extension)

        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)

        return JsonResponse({
            "success": True,
            "message": "Document uploaded and embeddings created successfully.",
            "document": file_name,
            "chunks": chunk_count
        })

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def docmind_ask_question(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Only POST requests allowed."}, status=405)

    try:
        if request.content_type != "application/json":
            return JsonResponse({"success": False, "error": "Content-Type must be application/json."}, status=400)

        data = json.loads(request.body.decode("utf-8"))
        question = data.get("question", "").strip()

        if not question:
            return JsonResponse({"success": False, "error": "Question is required."}, status=400)

        answer = generate_answer(question)

        return JsonResponse({
            "success": True,
            "question": question,
            "answer": answer
        })

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON payload."}, status=400)

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def create_story_view(request):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Only POST requests allowed."}, status=405)

    try:
        if request.content_type != "application/json":
            return JsonResponse({"success": False, "error": "Content-Type must be application/json."}, status=400)

        data = json.loads(request.body.decode("utf-8"))
        prompt = str(data.get("prompt", "")).strip()
        stream = bool(data.get("stream", False))

        if not prompt:
            return JsonResponse({"success": False, "error": "Prompt is required."}, status=400)

        # Imported here so a problem with the story model never breaks the other APIs
        from .amazing_AI_projects.storyGenerator import (
            DEFAULT_MAX_NEW_TOKENS,
            MAX_NEW_TOKENS_LIMIT,
            create_story,
            stream_story,
        )

        try:
            max_new_tokens = int(data.get("max_new_tokens", DEFAULT_MAX_NEW_TOKENS))
            temperature = float(data.get("temperature", 0.8))
            top_p = float(data.get("top_p", 0.9))
        except (TypeError, ValueError):
            return JsonResponse({"success": False, "error": "max_new_tokens, temperature and top_p must be numbers."}, status=400)

        max_new_tokens = max(1, min(max_new_tokens, MAX_NEW_TOKENS_LIMIT))
        temperature = max(0.1, min(temperature, 2.0))
        top_p = max(0.1, min(top_p, 1.0))

        if stream:
            response = StreamingHttpResponse(
                stream_story(prompt, max_new_tokens, temperature, top_p),
                content_type="text/plain; charset=utf-8",
            )
            response["Cache-Control"] = "no-cache"
            response["X-Accel-Buffering"] = "no"  # stop nginx buffering the stream
            return response

        story = create_story(prompt, max_new_tokens, temperature, top_p)

        return JsonResponse({
            "success": True,
            "prompt": prompt,
            "story": story
        })

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON payload."}, status=400)

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"success": False, "error": str(e)}, status=500)


# --- Visitor counter ---
# Own SQLite file in backend/data/ (excluded from the deploy rsync) so the
# counts survive deployments, unlike db.sqlite3 which is re-synced from git.
VISITOR_DB_PATH = Path(os.getenv(
    "VISITOR_DB_PATH",
    Path(__file__).resolve().parent.parent / "data" / "visitors.sqlite3",
))

# The frontend sends a random ID it keeps in the browser's localStorage.
VISITOR_ID_PATTERN = re.compile(r"^[A-Za-z0-9-]{8,64}$")


def count_visit(visitor_id=None, user_agent=""):
    """Add the browser ID if it's new (+1 visitor), always +1 visit, and return the counts."""
    VISITOR_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    with sqlite3.connect(VISITOR_DB_PATH, timeout=10) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS visitors (
                visitor_id TEXT PRIMARY KEY,
                first_seen TEXT NOT NULL,
                last_seen  TEXT NOT NULL,
                visits     INTEGER NOT NULL DEFAULT 1,
                user_agent TEXT
            )
        """)

        if visitor_id:
            exists = conn.execute("SELECT 1 FROM visitors WHERE visitor_id = ?", (visitor_id,)).fetchone()
            if exists:
                conn.execute(
                    "UPDATE visitors SET visits = visits + 1, last_seen = ? WHERE visitor_id = ?",
                    (now, visitor_id),
                )
            else:
                conn.execute(
                    "INSERT INTO visitors (visitor_id, first_seen, last_seen, visits, user_agent) VALUES (?, ?, ?, 1, ?)",
                    (visitor_id, now, now, user_agent[:300]),
                )

        unique_visitors, total_visits = conn.execute(
            "SELECT COUNT(*), COALESCE(SUM(visits), 0) FROM visitors"
        ).fetchone()

    return {"unique_visitors": unique_visitors, "total_visits": total_visits}


@csrf_exempt
def visitors_view(request):
    """POST {"visitor_id": "..."} counts this visit and returns the totals; GET only returns the totals."""
    if request.method == "GET":
        try:
            return JsonResponse({"success": True, **count_visit()})
        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"success": False, "error": str(e)}, status=500)

    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Only GET and POST requests allowed."}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON payload."}, status=400)

    visitor_id = data.get("visitor_id")
    if not isinstance(visitor_id, str) or not VISITOR_ID_PATTERN.match(visitor_id):
        return JsonResponse({"success": False, "error": "A valid visitor_id is required."}, status=400)

    try:
        stats = count_visit(visitor_id, request.META.get("HTTP_USER_AGENT", ""))
        return JsonResponse({"success": True, **stats})
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"success": False, "error": str(e)}, status=500)
