from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static

# 🔧 Swagger Schema View
schema_view = get_schema_view(
    openapi.Info(
        title="FamilyCart Rest APIs",
        default_version='v1',
        description="API documentation for FamilyCart platform",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="ravinkumarrakh@gmail.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=False,
    permission_classes=(permissions.AllowAny,),
)

admin.site.site_header = "FamilyCart Administration"       # Top header
admin.site.site_title = "FamilyCart Admin Portal"          # Browser tab title
admin.site.index_title = "Welcome to FamilyCart Admin"     # Index page title

urlpatterns = [
    path('admin/', admin.site.urls),

    # Your app URLs
    path('api/v1/user/', include('user.urls.v1')),
    path('api/v1/family/', include('family.urls.v1')),
    path('api/v1/grocery/', include('grocery.urls.v1')),
    path('api/v1/notification/', include('notification.urls.v1')),


    # Swagger Docs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)