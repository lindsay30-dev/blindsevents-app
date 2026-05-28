from django.contrib import admin
from .models import Category, Event


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display   = ['title', 'organizer', 'category', 'date',
                      'status', 'is_online', 'tickets_sold', 'available_spots']
    list_filter    = ['status', 'category', 'date', 'is_online']
    search_fields  = ['title', 'organizer__username']
