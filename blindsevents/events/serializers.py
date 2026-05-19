from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Event, TicketType, Booking, BookingItem


# ─── USER ──────────────────────────────────────────────
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Les mots de passe ne correspondent pas.'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'Cet email est déjà utilisé.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username   = validated_data['username'],
            email      = validated_data['email'],
            first_name = validated_data.get('first_name', ''),
            last_name  = validated_data.get('last_name', ''),
            password   = validated_data['password'],
        )
        return user


# ─── CATEGORY ──────────────────────────────────────────
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug']


# ─── TICKET TYPE ───────────────────────────────────────
class TicketTypeSerializer(serializers.ModelSerializer):
    remaining = serializers.ReadOnlyField()

    class Meta:
        model  = TicketType
        fields = ['id', 'name', 'price', 'quantity', 'remaining']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError('Le prix ne peut pas être négatif.')
        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError('La quantité doit être supérieure à 0.')
        return value


# ─── EVENT ─────────────────────────────────────────────
class EventListSerializer(serializers.ModelSerializer):
    """Sérialiseur léger pour la liste des événements"""
    category       = CategorySerializer(read_only=True)
    category_id    = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    organizer      = UserSerializer(read_only=True)
    ticket_types   = TicketTypeSerializer(many=True, read_only=True)
    tickets_sold   = serializers.ReadOnlyField()
    available_spots = serializers.ReadOnlyField()
    min_price      = serializers.SerializerMethodField()

    class Meta:
        model  = Event
        fields = [
            'id', 'title', 'description', 'location', 'date', 'time',
            'capacity', 'status', 'image', 'category', 'category_id',
            'organizer', 'ticket_types', 'tickets_sold', 'available_spots',
            'min_price', 'created_at',
        ]

    def get_min_price(self, obj):
        prices = [t.price for t in obj.ticket_types.all()]
        return min(prices) if prices else 0


class EventDetailSerializer(EventListSerializer):
    """Sérialiseur complet pour le détail d'un événement"""
    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields  # même champs, on peut enrichir plus tard

    def validate(self, data):
        if data.get('capacity', 0) <= 0:
            raise serializers.ValidationError({'capacity': 'La capacité doit être supérieure à 0.'})
        return data


# ─── BOOKING ITEM ──────────────────────────────────────
class BookingItemSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source='ticket_type.name', read_only=True)

    class Meta:
        model  = BookingItem
        fields = ['id', 'ticket_type', 'ticket_type_name', 'quantity', 'unit_price']


class BookingItemCreateSerializer(serializers.Serializer):
    ticket_type_id = serializers.IntegerField()
    quantity       = serializers.IntegerField(min_value=1, max_value=6)


# ─── BOOKING ───────────────────────────────────────────
class BookingSerializer(serializers.ModelSerializer):
    items        = BookingItemSerializer(many=True, read_only=True)
    user         = UserSerializer(read_only=True)
    event_title  = serializers.CharField(source='event.title', read_only=True)
    event_date   = serializers.DateField(source='event.date', read_only=True)

    class Meta:
        model  = Booking
        fields = [
            'id', 'user', 'event', 'event_title', 'event_date',
            'status', 'payment_method', 'payment_ref',
            'total_amount', 'items', 'created_at',
        ]


class BookingCreateSerializer(serializers.Serializer):
    event_id       = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['orange_money', 'mtn_momo', 'card', 'free'])
    phone_number   = serializers.CharField(required=False, allow_blank=True)
    items          = BookingItemCreateSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('Vous devez sélectionner au moins un billet.')
        return items

    def validate(self, data):
        # Vérifier que l'événement existe et est publié
        from .models import Event
        try:
            event = Event.objects.get(pk=data['event_id'], status='published')
        except Event.DoesNotExist:
            raise serializers.ValidationError({'event_id': 'Événement introuvable ou non disponible.'})

        # Vérifier chaque type de billet
        total = 0
        for item in data['items']:
            try:
                tt = TicketType.objects.get(pk=item['ticket_type_id'], event=event)
            except TicketType.DoesNotExist:
                raise serializers.ValidationError(
                    {'items': f'Type de billet #{item["ticket_type_id"]} invalide.'}
                )
            if tt.remaining < item['quantity']:
                raise serializers.ValidationError(
                    {'items': f'Stock insuffisant pour "{tt.name}". Disponible : {tt.remaining}.'}
                )
            total += tt.price * item['quantity']

        # Vérifier le moyen de paiement
        if total == 0:
            data['payment_method'] = 'free'
        elif data['payment_method'] in ['orange_money', 'mtn_momo'] and not data.get('phone_number'):
            raise serializers.ValidationError(
                {'phone_number': 'Le numéro de téléphone est requis pour ce mode de paiement.'}
            )

        data['_total']  = total
        data['_event']  = event
        return data