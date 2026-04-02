"""
Main URL configuration for eCommerce project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

# Root API endpoint
def api_root(request):
    return JsonResponse({
        'message': 'Welcome to eCommerce API',
        'version': '1.0.0',
        'status': 'running'
    })

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Root API endpoint
    path('', api_root, name='api-root'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # API Endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/orders/', include('apps.orders.urls')),
    
    # Google OAuth
    path('api/auth/social/', include('allauth.urls')),
    path('api/auth/dj-rest-auth/', include('dj_rest_auth.urls')),
    path('api/auth/dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
