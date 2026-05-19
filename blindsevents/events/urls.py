from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, ProfileView,
    CategoryViewSet, EventViewSet,
    TicketTypeViewSet, BookingViewSet,
)

router = DefaultRouter()
router.register('categories',   CategoryViewSet,   basename='category')
router.register('events',       EventViewSet,      basename='event')
router.register('ticket-types', TicketTypeViewSet, basename='tickettype')
router.register('bookings',     BookingViewSet,    basename='booking')

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(),          name='register'),
    path('auth/login/',    TokenObtainPairView.as_view(),   name='login'),
    path('auth/refresh/',  TokenRefreshView.as_view(),      name='token_refresh'),
    path('auth/profile/',  ProfileView.as_view(),           name='profile'),
    # CRUD
    path('', include(router.urls)),
]