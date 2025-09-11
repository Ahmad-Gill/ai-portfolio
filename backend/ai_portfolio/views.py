import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .amazing_AI_projects.mythBuster import mythbuster_answer







# amazing ai projects mythbuter
@csrf_exempt
def check_claim(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed."}, status=405)

    try:
        data = json.loads(request.body)
        claim = data.get("claim", "").strip()
        if not claim:
            return JsonResponse({"error": "Claim text is required."}, status=400)

        result = mythbuster_answer(claim)
        return JsonResponse(result, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
