from django.db import models
from apps.events.models import Event


class TicketType(models.Model):
    event      = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_types')
    name       = models.CharField(max_length=100)
    price      = models.DecimalField(max_digits=10, decimal_places=2)
    quantity   = models.PositiveIntegerField()
    sale_start = models.DateTimeField(null=True, blank=True)
    sale_end   = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.name} — {self.event.title}'

    @property
    def remaining(self):
        from django.db.models import Sum
        from apps.bookings.models import BookingItem
        sold = BookingItem.objects.filter(
            ticket_type=self,
            booking__status='confirmed'
        ).aggregate(total=Sum('quantity'))['total'] or 0
        return self.quantity - sold
