from django.db import models


class User(models.Model):
    id = models.CharField(max_length=200, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=128)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Customer(models.Model):
    id = models.CharField(max_length=200, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=128)
    image_url = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Invoice(models.Model):
    customer_id = models.ForeignKey(Customer, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20)
    date = models.CharField(max_length=128)


class Revenue(models.Model):
    month = models.CharField(max_length=3)
    revenue = models.DecimalField(max_digits=10, decimal_places=2)
