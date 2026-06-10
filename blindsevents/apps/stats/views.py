from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count
from apps.events.models import Event
from apps.bookings.models import Booking, BookingItem


class OrganizerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Stats pour l'organisateur connecté uniquement
        events = Event.objects.filter(organizer=request.user)

        total_events  = events.count()
        active_events = events.filter(status='published').count()

        bookings = Booking.objects.filter(
            event__organizer=request.user,
            status='confirmed'
        )
        total_bookings = bookings.count()
        total_revenue  = bookings.aggregate(t=Sum('total_amount'))['t'] or 0

        items = BookingItem.objects.filter(
            booking__event__organizer=request.user,
            booking__status='confirmed'
        )
        total_sold = items.aggregate(t=Sum('quantity'))['t'] or 0

        # Stats par événement
        events_stats = []
        for ev in events.prefetch_related('ticket_types')[:5]:
            ev_bookings = bookings.filter(event=ev)
            ev_revenue  = ev_bookings.aggregate(t=Sum('total_amount'))['t'] or 0
            ev_sold     = items.filter(booking__event=ev).aggregate(t=Sum('quantity'))['t'] or 0
            events_stats.append({
                'id':       ev.id,
                'title':    ev.title,
                'date':     str(ev.date),
                'status':   ev.status,
                'capacity': ev.capacity,
                'sold':     ev_sold,
                'revenue':  ev_revenue,
            })

        # Répartition des paiements
        om_total  = bookings.filter(payment_method='orange_money').aggregate(t=Sum('total_amount'))['t'] or 0
        mtn_total = bookings.filter(payment_method='mtn_momo').aggregate(t=Sum('total_amount'))['t'] or 0
        total_pm  = float(om_total) + float(mtn_total)
        om_pct    = round((float(om_total) / total_pm * 100), 1) if total_pm > 0 else 65
        mtn_pct   = round((float(mtn_total) / total_pm * 100), 1) if total_pm > 0 else 35

        return Response({
            'total_events'   : total_events,
            'active_events'  : active_events,
            'total_bookings' : total_bookings,
            'total_revenue'  : total_revenue,
            'total_sold'     : total_sold,
            'events_stats'   : events_stats,
            'payment_split'  : {
                'orange_money': {'amount': om_total,  'pct': om_pct},
                'mtn_momo':     {'amount': mtn_total, 'pct': mtn_pct},
            }
        })


class EventStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id, organizer=request.user)
        except Event.DoesNotExist:
            return Response({'detail': 'Introuvable.'}, status=404)

        bookings = Booking.objects.filter(event=event, status='confirmed')
        items    = BookingItem.objects.filter(booking__event=event, booking__status='confirmed')

        by_type = items.values(
            'ticket_type__name', 'ticket_type__price'
        ).annotate(total_qty=Sum('quantity'), total_revenue=Sum('unit_price'))

        total_sold    = items.aggregate(t=Sum('quantity'))['t'] or 0
        total_revenue = bookings.aggregate(t=Sum('total_amount'))['t'] or 0

        return Response({
            'event_id'      : event.id,
            'event_title'   : event.title,
            'total_bookings': bookings.count(),
            'total_sold'    : total_sold,
            'total_revenue' : total_revenue,
            'available_spots': event.available_spots,
            'fill_rate'     : round((total_sold / event.capacity) * 100, 1) if event.capacity else 0,
            'by_ticket_type': list(by_type),
        })