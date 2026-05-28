from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from apps.events.models import Event
from apps.bookings.models import Booking, BookingItem


class EventStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id, organizer=request.user)
        except Event.DoesNotExist:
            return Response(
                {'detail': 'Événement introuvable ou non autorisé.'},
                status=404
            )

        bookings = Booking.objects.filter(event=event, status='confirmed')
        items    = BookingItem.objects.filter(
            booking__event=event,
            booking__status='confirmed'
        )

        by_type = items.values(
            'ticket_type__name',
            'ticket_type__price'
        ).annotate(
            total_qty     = Sum('quantity'),
            total_revenue = Sum('unit_price')
        )

        total_sold    = items.aggregate(t=Sum('quantity'))['t'] or 0
        total_revenue = bookings.aggregate(t=Sum('total_amount'))['t'] or 0

        return Response({
            'event_id'      : event.id,
            'event_title'   : event.title,
            'total_bookings': bookings.count(),
            'total_sold'    : total_sold,
            'total_revenue' : total_revenue,
            'available_spots': event.available_spots,
            'fill_rate'     : round((total_sold / event.capacity) * 100, 1)
                              if event.capacity else 0,
            'by_ticket_type': list(by_type),
        })


class OrganizerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        events = Event.objects.filter(organizer=request.user)

        total_events   = events.count()
        active_events  = events.filter(status='published').count()
        total_bookings = Booking.objects.filter(
            event__organizer=request.user,
            status='confirmed'
        ).count()
        total_revenue  = Booking.objects.filter(
            event__organizer=request.user,
            status='confirmed'
        ).aggregate(t=Sum('total_amount'))['t'] or 0
        total_sold     = BookingItem.objects.filter(
            booking__event__organizer=request.user,
            booking__status='confirmed'
        ).aggregate(t=Sum('quantity'))['t'] or 0

        return Response({
            'total_events'  : total_events,
            'active_events' : active_events,
            'total_bookings': total_bookings,
            'total_revenue' : total_revenue,
            'total_sold'    : total_sold,
        })
