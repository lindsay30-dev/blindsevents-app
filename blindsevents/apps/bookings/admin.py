from django.contrib import admin
from .models import Booking, BookingItem


class BookingItemInline(admin.TabularInline):
    model  = BookingItem
    extra  = 0


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ['id', 'user', 'event', 'status',
                     'payment_method', 'total_amount', 'created_at']
    list_filter   = ['status', 'payment_method']
    search_fields = ['user__username', 'payment_ref']
    inlines       = [BookingItemInline]


@admin.register(BookingItem)
class BookingItemAdmin(admin.ModelAdmin):
    list_display = ['booking', 'ticket_type', 'quantity', 'unit_price']
