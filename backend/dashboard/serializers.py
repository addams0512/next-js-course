from rest_framework import serializers

from .models import Customer, Invoice, Revenue, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class RevenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Revenue
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ["id", "amount", "date", "status", "customer_id"]


class InvoiceListSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(source="customer_id", read_only=True)

    class Meta:
        model = Invoice
        fields = ["id", "customer", "amount", "status", "date"]
