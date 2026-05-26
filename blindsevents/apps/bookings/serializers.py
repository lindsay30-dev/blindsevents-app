from rest_framework import serializers
from .models import Booking, BookingItem
from apps.tickets.models import TicketType
from apps.events.models import Event


class BookingItemSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(
        source='ticket_type.name', read_only=True
    )

    class Meta:
        model  = BookingItem
        fields = ['id', 'ticket_type', 'ticket_type_name',
                  'quantity', 'unit_price']


class BookingSerializer(serializers.ModelSerializer):
    items        = BookingItemSerializer(many=True, read_only=True)
    event_title  = serializers.CharField(source='event.title',    read_only=True)
    event_date   = serializers.DateField(source='event.date',     read_only=True)
    event_time   = serializers.TimeField(source='event.time',     read_only=True)
    event_location = serializers.CharField(source='event.location', read_only=True)
    user_name    = serializers.SerializerMethodField()

    class Meta:
        model  = Booking
        fields = [
            'id', 'user', 'user_name', 'event', 'event_title',
            'event_date', 'event_time', 'event_location',
            'status', 'payment_method', 'payment_ref',
            'phone_number', 'total_amount', 'items', 'created_at',
        ]

    def get_user_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'.strip() or obj.user.username


class BookingItemCreateSerializer(serializers.Serializer):
    ticket_type_id = serializers.IntegerField()
    quantity       = serializers.IntegerField(min_value=1, max_value=6)


class BookingCreateSerializer(serializers.Serializer):
    event_id       = serializers.IntegerField()
    payment_method = serializers.ChoiceField(
        choices=['orange_money', 'mtn_momo', 'card', 'free']
    )
    phone_number   = serializers.CharField(required=False, allow_blank=True)
    items          = BookingItemCreateSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError(
                'Vous devez sélectionner au moins un billet.'
            )
        return items

    def validate(self, data):
        # Vérifier l'événement
        try:
            event = Event.objects.get(pk=data['event_id'], status='published')
        except Event.DoesNotExist:
            raise serializers.ValidationError(
                {'event_id': 'Événement introuvable ou non disponible.'}
            )

        total = 0
        for item in data['items']:
            try:
                tt = TicketType.objects.get(
                    pk=item['ticket_type_id'], event=event
                )
            except TicketType.DoesNotExist:
                raise serializers.ValidationError(
                    {'items': f'Type de billet #{item["ticket_type_id"]} invalide.'}
                )

            if tt.remaining < item['quantity']:
                raise serializers.ValidationError(
                    {'items': f'Stock insuffisant pour "{tt.name}". '
                              f'Disponible : {tt.remaining}.'}
                )
            total += tt.price * item['quantity']

        # Vérifier paiement mobile
        if total == 0:
            data['payment_method'] = 'free'
        elif data['payment_method'] in ['orange_money', 'mtn_momo']:
            if not data.get('phone_number'):
                raise serializers.ValidationError(
                    {'phone_number': 'Le numéro de téléphone est requis '
                                     'pour ce mode de paiement.'}
                )

        data['_total'] = total
        data['_event'] = event
        return data