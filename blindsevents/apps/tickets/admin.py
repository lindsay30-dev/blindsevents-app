from django.contrib import admin
from .models import TicketType


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'event', 'price', 'quantity',
                    'remaining', 'sale_start', 'sale_end']
    list_filter  = ['event']
