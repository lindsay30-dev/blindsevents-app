from rest_framework import serializers


class EventStatsSerializer(serializers.Serializer):
    event_id        = serializers.IntegerField()
    event_title     = serializers.CharField()
    total_bookings  = serializers.IntegerField()
    total_sold      = serializers.IntegerField()
    total_revenue   = serializers.DecimalField(max_digits=12, decimal_places=2)
    available_spots = serializers.IntegerField()
    fill_rate       = serializers.FloatField()
    by_ticket_type  = serializers.ListField()