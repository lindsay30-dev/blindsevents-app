from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketTypeViewSet

router = DefaultRouter()
router.register('ticket-types', TicketTypeViewSet, basename='tickettype')

urlpatterns = [
    path('', include(router.urls)),
]