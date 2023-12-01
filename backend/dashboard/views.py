import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import models, serializers

logger = logging.getLogger(__name__)


class UserLists(APIView):
    def get(self, request):
        users = models.User.objects.all()
        serializer = serializers.UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = serializers.UserSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomersList(APIView):
    def get(self, request):
        todos = models.Customer.objects.all()
        serializer = serializers.CustomerSerializer(todos, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = serializers.CustomerSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvoiceCreateView(APIView):
    def get(self, request):
        invoice = models.Invoice.objects.all()
        serializer = serializers.InvoiceSerializer(invoice, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = serializers.InvoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvoiceListView(APIView):
    def get(self, request):
        invoice = models.Invoice.objects.all()
        serializer = serializers.InvoiceListSerializer(invoice, many=True)
        return Response(serializer.data)


class InvoiceEditView(APIView):
    @staticmethod
    def get_invoice(id):
        return get_object_or_404(models.Invoice, id=id)

    def get(self, request, id):
        logger.debug(id)
        invoice = self.get_invoice(id)
        serializer = serializers.InvoiceSerializer(invoice)
        logger.debug(invoice)
        logger.debug(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id):
        invoice = self.get_invoice(id)
        serializer = serializers.InvoiceSerializer(invoice, data=request.data)
        try:
            serializer.is_valid()
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": f"Can not update invoice with ${e}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def delete(self, request, id):
        invoice = self.get_invoice(id)
        invoice.delete()
        return Response(status=status.HTTP_200_OK)


class RevenueList(APIView):
    def get(self, request):
        revenue = models.Revenue.objects.all()
        serializer = serializers.RevenueSerializer(revenue, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = serializers.RevenueSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
