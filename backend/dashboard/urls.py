from django.urls import path

from .views import (
    CustomersList,
    InvoiceCreateView,
    InvoiceEditView,
    InvoiceListView,
    RevenueList,
    UserLists,
)

urlpatterns = [
    path("users/", UserLists.as_view(), name="user-list"),
    path("customers/", CustomersList.as_view(), name="customer-list"),
    path("revenue/", RevenueList.as_view(), name="revenue-list"),
    path("invoice-create/", InvoiceCreateView.as_view(), name="create-invoice"),
    path("invoice-list/", InvoiceListView.as_view(), name="list-invoices"),
    path(
        "invoice-list/<int:id>",
        InvoiceEditView.as_view(),
        name="edit-invoice",
    ),
]
