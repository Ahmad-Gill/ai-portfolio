from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
from .views import (
    check_claim, translate_text, painting_view1,
    painting_view2, painting_faces_view, abstract_painting_view
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

    # Root-level React build assets
    path(
        "manifest.json",
        serve,
        {"path": "manifest.json", "document_root": settings.BASE_DIR / "frontend" / "build"},
    ),
    path(
        "animation.json",
        serve,
        {"path": "animation.json", "document_root": settings.BASE_DIR / "frontend" / "build"},
    ),

    # 👇 Catch-all (serve React app for non-API, non-static routes)
    re_path(r'^(?!api/|static/).*$', TemplateView.as_view(template_name='index.html')),
]
