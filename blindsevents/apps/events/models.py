from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = 'Catégories'

    def __str__(self):
        return self.name


class Event(models.Model):
    STATUS_CHOICES = [
        ('draft',      'Brouillon'),
        ('published',  'Publié'),
        ('cancelled',  'Annulé'),
        ('ended',      'Terminé'),
    ]

    organizer    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    category     = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    title        = models.CharField(max_length=255)
    description  = models.TextField()
    location     = models.CharField(max_length=255)
    date         = models.DateField()
    time         = models.TimeField()
    capacity     = models.PositiveIntegerField()
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    image        = models.ImageField(upload_to='events/', blank=True, null=True)
    is_online    = models.BooleanField(default=False)
    online_link  = models.URLField(blank=True, null=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return self.title

    @property
    def tickets_sold(self):
        from django.db.models import Sum
        from apps.bookings.models import BookingItem
        result = BookingItem.objects.filter(
            booking__event=self,
            booking__status='confirmed'
        ).aggregate(total=Sum('quantity'))
        return result['total'] or 0

    @property
    def available_spots(self):
        return self.capacity - self.tickets_sold
