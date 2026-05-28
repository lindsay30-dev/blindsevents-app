from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import TicketType
from .serializers import TicketTypeSerializer
from apps.events.models import Event


class TicketTypeViewSet(viewsets.ModelViewSet):
    serializer_class   = TicketTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TicketType.objects.filter(
            event__organizer=self.request.user
        ).select_related('event')

    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        try:
            event = Event.objects.get(pk=event_id, organizer=self.request.user)
        except Event.DoesNotExist:
            raise Exception('Événement introuvable ou non autorisé.')
        serializer.save(event=event)

    def destroy(self, request, *args, **kwargs):
        ticket = self.get_object()
        if ticket.booking_items.filter(booking__status='confirmed').exists():
            return Response(
                {'detail': 'Impossible de supprimer un type de billet déjà vendu.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)