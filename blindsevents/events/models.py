from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Event(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publié'),
        ('cancelled', 'Annulé'),
        ('ended', 'Terminé'),
    ]

    organizer   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    category    = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    title       = models.CharField(max_length=255)
    description = models.TextField()
    location    = models.CharField(max_length=255)
    date        = models.DateField()
    time        = models.TimeField()
    capacity    = models.PositiveIntegerField()
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    image       = models.ImageField(upload_to='events/', blank=True, null=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return self.title

    @property
    def tickets_sold(self):
        return self.bookings.filter(status='confirmed').aggregate(
            total=models.Sum('quantity')
        )['total'] or 0

    @property
    def available_spots(self):
        return self.capacity - self.tickets_sold


class TicketType(models.Model):
    event    = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='ticket_types')
    name     = models.CharField(max_length=100)   # Standard, VIP, Étudiant…
    price    = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()       # stock disponible

    def __str__(self):
        return f'{self.name} — {self.event.title}'

    @property
    def remaining(self):
        sold = self.booking_items.filter(
            booking__status='confirmed'
        ).aggregate(total=models.Sum('quantity'))['total'] or 0
        return self.quantity - sold


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmé'),
        ('cancelled', 'Annulé'),
        ('refunded', 'Remboursé'),
    ]
    PAYMENT_CHOICES = [
        ('orange_money', 'Orange Money'),
        ('mtn_momo', 'MTN Mobile Money'),
        ('card', 'Carte bancaire'),
        ('free', 'Gratuit'),
    ]

    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    event           = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method  = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    payment_ref     = models.CharField(max_length=100, blank=True)
    total_amount    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Booking #{self.pk} — {self.user.username}'


class BookingItem(models.Model):
    booking     = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE, related_name='booking_items')
    quantity    = models.PositiveIntegerField(default=1)
    unit_price  = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity}× {self.ticket_type.name}'

