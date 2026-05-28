from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Event
from .serializers import CategorySerializer, EventSerializer


class IsSuperUserOrReadOnly(permissions.BasePermission):
    """Seul le staff peut créer/modifier/supprimer des catégories"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


# ─── CATEGORY ──────────────────────────────────────────
class CategoryViewSet(viewsets.ModelViewSet):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [IsSuperUserOrReadOnly]


# ─── EVENT ─────────────────────────────────────────────
class EventViewSet(viewsets.ModelViewSet):
    serializer_class   = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Event.objects.select_related(
            'organizer', 'category'
        ).prefetch_related('ticket_types')

        if self.action == 'list':
            qs = qs.filter(status='published')

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__slug=category)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)

        is_online = self.request.query_params.get('is_online')
        if is_online is not None:
            qs = qs.filter(is_online=is_online.lower() == 'true')

        return qs

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

    @action(detail=False, methods=['get'],
            permission_classes=[permissions.IsAuthenticated])
    def my_events(self, request):
        """Événements créés par l'organisateur connecté"""
        qs = Event.objects.filter(
            organizer=request.user
        ).select_related('category').prefetch_related('ticket_types')
        serializer = EventSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'],
            permission_classes=[permissions.IsAuthenticated])
    def publish(self, request, pk=None):
        """Publier un événement"""
        event = self.get_object()
        if event.organizer != request.user:
            return Response(
                {'detail': 'Non autorisé.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if not event.ticket_types.exists():
            return Response(
                {'detail': 'Ajoutez au moins un type de billet avant de publier.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        event.status = 'published'
        event.save()
        return Response({'detail': 'Événement publié avec succès.'})

    @action(detail=True, methods=['post'],
            permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        """Annuler un événement"""
        event = self.get_object()
        if event.organizer != request.user:
            return Response(
                {'detail': 'Non autorisé.'},
                status=status.HTTP_403_FORBIDDEN
            )
        event.status = 'cancelled'
        event.save()
        return Response({'detail': 'Événement annulé.'})