from rest_framework import serializers
from .models import TicketType


class TicketTypeSerializer(serializers.ModelSerializer):
    remaining = serializers.ReadOnlyField()

    class Meta:
        model  = TicketType
        fields = ['id', 'event', 'name', 'price', 'quantity',
                  'remaining', 'sale_start', 'sale_end']

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                'Le prix ne peut pas être négatif.'
            )
        return value

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                'La quantité doit être supérieure à 0.'
            )
        return value

    def validate(self, data):
        sale_start = data.get('sale_start')
        sale_end   = data.get('sale_end')
        if sale_start and sale_end and sale_end <= sale_start:
            raise serializers.ValidationError(
                {'sale_end': 'La date de fin doit être après la date de début.'}
            )
        return data