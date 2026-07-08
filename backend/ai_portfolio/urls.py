from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, re_path
from .views import (
    check_claim, translate_text, painting_view1,
    painting_view2, painting_faces_view, abstract_painting_view,text_to_speech_view
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/amazing_ai_project/aimythbuster/', check_claim),
    path("api/amazing_ai_project/translate/", translate_text),
    path("api/amazing_ai_project/painting1/", painting_view1),
    path("api/amazing_ai_project/painting2/", painting_view2),
    path("api/amazing_ai_project/painting3/", painting_faces_view),
    path("api/amazing_ai_project/painting4/", abstract_painting_view),
    path("api/amazing_ai_project/speechToText/", text_to_speech_view),  # New endpoint for speech-to-text
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
