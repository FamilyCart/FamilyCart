from django.db import models
from ckeditor.fields import RichTextField
import string
import uuid
from django.utils import timezone
from django.conf import settings
from family.models import FamilyMembership




class GroceryList(models.Model):
    """Represents a single grocery list"""
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    family_membership = models.ForeignKey(FamilyMembership, on_delete=models.CASCADE, related_name="grocery_lists")
    name = models.CharField(max_length=255, null=False, blank=False, db_index=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="list_created_by")
    description = RichTextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "grocery_lists"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["name"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.family_membership.family.name})"

class GroceryItem(models.Model):
	class QuantityType(models.TextChoices):
	    GRAM = "Gram", "Gram"
	    LITER = "Liter", "Liter"
	    COUNT = "Count", "Count"

	uuid = models.UUIDField(default=uuid.uuid4, editable=False)
	grocery_list = models.ForeignKey(GroceryList, on_delete=models.CASCADE, null=False, blank=False, related_name="items")
	name = models.CharField(max_length=255, null=False, blank=False, db_index=True)
	quantity = models.FloatField(default=1)
	quantity_type = models.CharField(max_length=10,choices=QuantityType.choices,default=QuantityType.COUNT)
	purchased = models.BooleanField(default=False)
	created_by = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,blank=True,related_name="created_by")
	# price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=False, blank=False)
	note = RichTextField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = "grocery_items"
		ordering = ["-created_at"]
		indexes = [
		    models.Index(fields=["name"]),
		    models.Index(fields=["purchased"]),
		    models.Index(fields=["quantity_type"]),
		]

	def __str__(self):
		return f"{self.name} ({self.quantity} {self.quantity_type})"