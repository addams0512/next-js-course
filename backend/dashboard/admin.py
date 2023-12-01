from django.contrib import admin

from .models import Customer, Invoice, Revenue, User

# Register your models here.

admin.site.register(User)
admin.site.register(Customer)
admin.site.register(Invoice)
admin.site.register(Revenue)
