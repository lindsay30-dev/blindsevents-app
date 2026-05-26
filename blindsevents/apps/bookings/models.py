from django.db import models
from django.contrib.auth.models import User
from apps.events.models import Event
from apps.tickets.models import TicketType


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending',   'En attente'),
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
        ('refunded',  'Remboursé'),
    ]
    PAYMENT_CHOICES = [
        ('orange_money', 'Orange Money'),
        ('mtn_momo',     'MTN Mobile Money'),
        ('card',         'Carte bancaire'),
        ('free',         'Gratuit'),
    ]

    user           = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    event          = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_ref    = models.CharField(max_length=100, blank=True)
    phone_number   = models.CharField(max_length=20, blank=True)
    total_amount   = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Booking #{self.pk} — {self.user.username}'


class BookingItem(models.Model):
    booking     = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE, related_name='booking_items')
    quantity    = models.PositiveIntegerField(default=1)
    unit_price  = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity}× {self.ticket_type.name}'