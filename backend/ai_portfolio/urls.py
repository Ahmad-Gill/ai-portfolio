from django.contrib import admin
from django.urls import path
from .views import check_claim

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/amazing_ai_project/aimythbuster/', check_claim),
]
