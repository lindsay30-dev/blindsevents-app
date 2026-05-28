import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking, BookingItem
from .serializers import BookingSerializer, BookingCreateSerializer
from apps.tickets.models import TicketType


class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related('event').prefetch_related('items__ticket_type')

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data  = serializer.validated_data
        event = data['_event']
        total = data['_total']

        # Génération référence paiement
        payment_ref = ''
        if data['payment_method'] != 'free':
            payment_ref = f'BSE-{uuid.uuid4().hex[:10].upper()}'

        # Création réservation
        booking = Booking.objects.create(
            user           = request.user,
            event          = event,
            status         = 'confirmed',
            payment_method = data['payment_method'],
            payment_ref    = payment_ref,
            phone_number   = data.get('phone_number', ''),
            total_amount   = total,
        )

        # Création des items
        for item in data['items']:
            tt = TicketType.objects.get(pk=item['ticket_type_id'])
            BookingItem.objects.create(
                booking     = booking,
                ticket_type = tt,
                quantity    = item['quantity'],
                unit_price  = tt.price,
            )

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Annuler une réservation"""
        booking = self.get_object()
        if booking.status != 'confirmed':
            return Response(
                {'detail': 'Seules les réservations confirmées peuvent être annulées.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save()
        return Response({'detail': 'Réservation annulée avec succès.'})

    @action(detail=False, methods=['get'])
    def wallet(self, request):
        """Portefeuille — tous les billets de l'utilisateur connecté"""
        bookings = Booking.objects.filter(
            user=request.user,
            status='confirmed'
        ).select_related('event').prefetch_related('items__ticket_type')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'],
            permission_classes=[permissions.IsAuthenticated])
    def verify(self, request):
        """Vérification d'un billet via sa référence"""
        payment_ref = request.data.get('payment_ref', '').strip()
        if not payment_ref:
            return Response(
                {'detail': 'Référence de paiement requise.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            booking = Booking.objects.get(
                payment_ref=payment_ref,
                status='confirmed'
            )
            return Response({
                'valid'       : True,
                'booking_id'  : booking.id,
                'user'        : f'{booking.user.first_name} {booking.user.last_name}',
                'event'       : booking.event.title,
                'date'        : booking.event.date,
                'total_amount': booking.total_amount,
            })
        except Booking.DoesNotExist:
            return Response(
                {'valid': False, 'detail': 'Billet invalide ou introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
