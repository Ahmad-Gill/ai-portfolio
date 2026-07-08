import json
from django.http import JsonResponse
from django.http import HttpResponse
import os
import tempfile
from pydub import AudioSegment
import io
from django.views.decorators.csrf import csrf_exempt

from .amazing_AI_projects.textToSpeech import generate_voice
from .amazing_AI_projects.mythBuster import mythbuster_answer
from .amazing_AI_projects.translator import translate_and_correct  
from .amazing_AI_projects.painting_generator1 import generate_meaningful_abstract_painting
from .amazing_AI_projects.painting_generator2 import generate_meaningful_abstract_painting1
from .amazing_AI_projects.painting_generator3 import generate_abstract_painting_with_faces
from .amazing_AI_projects.painting_generator4 import generate_abstract_painting







# amazing ai projects mythbuter
@csrf_exempt
def check_claim(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed."}, status=405)

    try:
        # Parse the incoming JSON
        data = json.loads(request.body.decode("utf-8"))
        claim = data.get("claim", "").strip()
        if not claim:
            return JsonResponse({"error": "Claim text is required."}, status=400)

        # Your business logic
        result = mythbuster_answer(claim)
        return JsonResponse(result, safe=False)

    except json.JSONDecodeError as e:
        # Invalid JSON in request
        return JsonResponse({"error": "Invalid JSON payload.", "details": str(e)}, status=400)

    except Exception as e:
        # Capture full traceback for debugging
        tb = traceback.format_exc()
        print("Error in check_claim:\n", tb)  # This prints full traceback to your runserver console

        # Return error to the frontend
        return JsonResponse({
            "error": "Internal Server Error",
            "message": str(e),
            "traceback": tb  # You can remove this in production
        }, status=500)

# amazing ai projects translation
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

        try:
            result = translate_and_correct(text, language)
            return JsonResponse(result)
        except Exception as e:
            import traceback; traceback.print_exc()
            return JsonResponse({"error": f"translate_and_correct failed: {e}"}, status=500)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON payload."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
# amazing ai projects painting 1
def painting_view1(request):
    image = generate_meaningful_abstract_painting(1280, 720)  # HD
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")
# amazing ai projects painting 2
def painting_view2(request):
    """Return dynamically generated abstract painting as PNG."""
    image = generate_meaningful_abstract_painting1(1280, 720)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")
# amazing ai projects painting 3
def painting_faces_view(request):
    """Return abstract painting with faces as PNG."""
    img = generate_abstract_painting_with_faces(1280, 720)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return HttpResponse(buffer.getvalue(), content_type="image/png")
# amazing ai projects painting 4
def abstract_painting_view(request):
    painting = generate_abstract_painting(1280, 720)  # HD
    img_io = io.BytesIO()
    painting.save(img_io, format="PNG")
    img_io.seek(0)
    return HttpResponse(img_io, content_type="image/png")
@csrf_exempt
def text_to_speech_view(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST requests allowed."},
            status=405
        )

    temp_wav = None

    try:
        text = request.POST.get("text")
        audio_file = request.FILES.get("audio")

        if not text:
            return JsonResponse({"error": "Text is required."}, status=400)

        if not audio_file:
            return JsonResponse({"error": "Speaker audio is required."}, status=400)

        # Convert any audio format to WAV
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

        return JsonResponse({
            "audio": audio_url
        })

    except Exception as e:
        import traceback
        traceback.print_exc()

        return JsonResponse(
            {"error": str(e)},
            status=500
        )

    finally:
        if temp_wav and os.path.exists(temp_wav):
            os.remove(temp_wav)