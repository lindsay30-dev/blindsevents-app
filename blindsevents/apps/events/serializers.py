from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Event
from apps.tickets.models import TicketType


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug']


class OrganizerSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class TicketTypeMiniSerializer(serializers.ModelSerializer):
    remaining = serializers.ReadOnlyField()

    class Meta:
        model  = TicketType
        fields = ['id', 'name', 'price', 'quantity', 'remaining',
                  'sale_start', 'sale_end']


class EventSerializer(serializers.ModelSerializer):
    category        = CategorySerializer(read_only=True)
    category_id     = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    organizer       = OrganizerSerializer(read_only=True)
    ticket_types    = TicketTypeMiniSerializer(many=True, read_only=True)
    tickets_sold    = serializers.ReadOnlyField()
    available_spots = serializers.ReadOnlyField()
    min_price       = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'description', 'location',
            'date', 'time', 'capacity', 'status',
            'image', 'is_online', 'online_link',
            'category', 'category_id', 'organizer',
            'ticket_types', 'tickets_sold', 'available_spots',
            'min_price', 'created_at', 'updated_at',
        ]

    def get_min_price(self, obj):
        prices = [t.price for t in obj.ticket_types.all()]
        return min(prices) if prices else 0

    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'La capacité doit être supérieure à 0.'
            )
        return value

    def validate(self, data):
        if data.get('is_online') and not data.get('online_link'):
            raise serializers.ValidationError(
                {'online_link': 'Un lien est requis pour un événement en ligne.'}
            )
        return data