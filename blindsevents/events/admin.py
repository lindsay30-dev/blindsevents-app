from django.contrib import admin
from .models import Category, Event, TicketType, Booking, BookingItem


class TicketTypeInline(admin.TabularInline):
    model  = TicketType
    extra  = 1


class BookingItemInline(admin.TabularInline):
    model  = BookingItem
    extra  = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display   = ['title', 'organizer', 'category', 'date', 'status', 'tickets_sold', 'available_spots']
    list_filter    = ['status', 'category', 'date']
    search_fields  = ['title', 'organizer__username']
    inlines        = [TicketTypeInline]


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'event', 'price', 'quantity', 'remaining']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ['id', 'user', 'event', 'status', 'payment_method', 'total_amount', 'created_at']
    list_filter   = ['status', 'payment_method']
    search_fields = ['user__username', 'payment_ref']
    inlines       = [BookingItemInline]


@admin.register(BookingItem)
class BookingItemAdmin(admin.ModelAdmin):
    list_display = ['booking', 'ticket_type', 'quantity', 'unit_price']
