from django.urls import path
from .views import EventStatsView, OrganizerDashboardView

urlpatterns = [
    path('stats/dashboard/', OrganizerDashboardView.as_view(), name='dashboard'),
    path('stats/events/<int:event_id>/', EventStatsView.as_view(), name='event-stats'),
]