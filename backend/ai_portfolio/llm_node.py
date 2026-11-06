import json
import os
import traceback

import requests
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt


# --- Custom LLM Node proxy ---
# The LLM server (llm.ahmadgill.com) sends no CORS headers, so the browser
# can't call it directly. These views forward requests to it unchanged.
# Admin credentials are never stored here: the admin page sends them with
# each request and they are passed straight through.

LLM_NODE_URL = "https://llm.ahmadgill.com"

# Used when a visitor doesn't enter their own key, so the test key never
# reaches the browser.
LLM_NODE_TEST_API_KEY = os.getenv("LLM_NODE_TEST_API_KEY")

# The first request after a server restart loads the model (~1 minute),
# and answers are streamed for a while after that.
CONNECT_TIMEOUT = 15
READ_TIMEOUT = 300


def forward_json(resp):
    """Return the LLM server's JSON response with its status code."""
    try:
        data = resp.json()
    except ValueError:
        data = {"detail": resp.text or "Unexpected response from the LLM server."}
    return JsonResponse(data, status=resp.status_code, safe=False)


def admin_headers(request):
    headers = {"Authorization": request.headers.get("Authorization", "")}
    if "X-Password" in request.headers:
        headers["X-Password"] = request.headers["X-Password"]
    return headers


def call_llm(method, path, **kwargs):
    try:
        return requests.request(
            method,
            f"{LLM_NODE_URL}{path}",
            timeout=(CONNECT_TIMEOUT, READ_TIMEOUT),
            **kwargs,
        ), None
    except requests.RequestException as e:
        print(f"LLM node request failed ({method} {path}): {e}")
        return None, JsonResponse({"detail": "The LLM server is not reachable right now."}, status=502)


def parse_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}"), None
    except json.JSONDecodeError:
        return None, JsonResponse({"detail": "Invalid JSON payload."}, status=400)


def llm_models_view(request):
    if request.method != "GET":
        return JsonResponse({"detail": "Only GET requests allowed."}, status=405)

    resp, error = call_llm("GET", "/models")
    return error or forward_json(resp)


@csrf_exempt
def llm_generate_view(request):
    if request.method != "POST":
        return JsonResponse({"detail": "Only POST requests allowed."}, status=405)

    data, error = parse_body(request)
    if error:
        return error

    if not str(data.get("api-key") or "").strip():
        if not LLM_NODE_TEST_API_KEY:
            return JsonResponse({"detail": "Enter an API key. The public test key is not configured."}, status=401)
        data["api-key"] = LLM_NODE_TEST_API_KEY

    stream = data.get("stream", True) is not False
    resp, error = call_llm("POST", "/generate", json=data, stream=stream)
    if error:
        return error

    # Errors come back as JSON before any streaming starts
    if resp.status_code != 200 or not stream:
        return forward_json(resp)

    def relay():
        try:
            for chunk in resp.iter_content(chunk_size=None):
                if chunk:
                    yield chunk
        except requests.RequestException:
            traceback.print_exc()
        finally:
            resp.close()

    response = StreamingHttpResponse(relay(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"  # stop nginx buffering the stream
    return response


@csrf_exempt
def llm_keys_view(request):
    """GET lists keys (X-Password header), POST creates one (password in body)."""
    if request.method == "GET":
        resp, error = call_llm("GET", "/keys", headers=admin_headers(request))
        return error or forward_json(resp)

    if request.method == "POST":
        data, error = parse_body(request)
        if error:
            return error
        resp, error = call_llm("POST", "/keys", headers=admin_headers(request), json=data)
        return error or forward_json(resp)

    return JsonResponse({"detail": "Only GET and POST requests allowed."}, status=405)


@csrf_exempt
def llm_key_detail_view(request, key_id):
    """DELETE removes a key (X-Password header)."""
    if request.method != "DELETE":
        return JsonResponse({"detail": "Only DELETE requests allowed."}, status=405)

    resp, error = call_llm("DELETE", f"/keys/{key_id}", headers=admin_headers(request))
    return error or forward_json(resp)


@csrf_exempt
def llm_key_limit_view(request, key_id):
    """PATCH changes a key's request limit (password in body)."""
    if request.method != "PATCH":
        return JsonResponse({"detail": "Only PATCH requests allowed."}, status=405)

    data, error = parse_body(request)
    if error:
        return error
    resp, error = call_llm("PATCH", f"/keys/{key_id}/limit", headers=admin_headers(request), json=data)
    return error or forward_json(resp)
