from django.shortcuts import render
import uuid
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Event, TicketType, Booking, BookingItem
from .serializers import (
    UserSerializer, RegisterSerializer,
    CategorySerializer,
    EventListSerializer, EventDetailSerializer,
    TicketTypeSerializer,
    BookingSerializer, BookingCreateSerializer,
)


# ─── AUTH ──────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user':    UserSerializer(user).data,
            'refresh': str(refresh),
            'access':  str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── CATEGORY ──────────────────────────────────────────
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]


# ─── EVENT ─────────────────────────────────────────────
class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Event.objects.select_related('organizer', 'category').prefetch_related('ticket_types')

        # Filtre par statut : public voit uniquement published
        if self.request.user.is_authenticated:
            if self.action in ['my_events']:
                return qs.filter(organizer=self.request.user)
        
        if self.action == 'list':
            qs = qs.filter(status='published')

        # Filtres optionnels via query params
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)

        return qs

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return EventDetailSerializer
        return EventListSerializer

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

    def update(self, request, *args, **kwargs):
        event = self.get_object()
        if event.organizer != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'Vous n\'êtes pas l\'organisateur de cet événement.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        event = self.get_object()
        if event.organizer != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'Action non autorisée.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_events(self, request):
        """Retourne les événements de l'organisateur connecté"""
        qs = Event.objects.filter(organizer=request.user).select_related('category').prefetch_related('ticket_types')
        serializer = EventListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ticket_types(self, request, pk=None):
        """Retourne les types de billets d'un événement"""
        event = self.get_object()
        serializer = TicketTypeSerializer(event.ticket_types.all(), many=True)
        return Response(serializer.data)


# ─── TICKET TYPE ───────────────────────────────────────
class TicketTypeViewSet(viewsets.ModelViewSet):
    serializer_class   = TicketTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TicketType.objects.filter(event__organizer=self.request.user)

    def perform_create(self, serializer):
        event_id = self.request.data.get('event')
        event    = Event.objects.get(pk=event_id, organizer=self.request.user)
        serializer.save(event=event)


# ─── BOOKING ───────────────────────────────────────────
class BookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'event', 'user'
        ).prefetch_related('items__ticket_type')

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

        # Simulation paiement
        payment_ref = ''
        if data['payment_method'] != 'free':
            payment_ref = f'BSE-{uuid.uuid4().hex[:10].upper()}'

        # Créer la réservation
        booking = Booking.objects.create(
            user           = request.user,
            event          = event,
            status         = 'confirmed',
            payment_method = data['payment_method'],
            payment_ref    = payment_ref,
            total_amount   = total,
        )

        # Créer les items
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
        booking = self.get_object()
        if booking.status != 'confirmed':
            return Response(
                {'detail': 'Seules les réservations confirmées peuvent être annulées.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save()
        return Response({'detail': 'Réservation annulée avec succès.'})
# Create your views here.
