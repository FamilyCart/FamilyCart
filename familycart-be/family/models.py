from django.db import models
from ckeditor.fields import RichTextField
import string
import uuid
from django.utils import timezone
from django.conf import settings

class Family(models.Model):
	uuid = models.UUIDField(default=uuid.uuid4, editable=False)
	name = models.CharField(max_length=100, null=False, blank=False, db_index=True)
	family_code = models.CharField(max_length=20, unique=True, db_index=True, null=False, blank=False)
	description = RichTextField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = "families"
		ordering = ["-created_at"]
		indexes = [
			models.Index(fields=["name"]),
			models.Index(fields=["family_code"]),
		]

	def __str__(self):
	    return f"{self.name} - {self.family_code} "



class Role(models.Model):
	uuid = models.UUIDField(default=uuid.uuid4, editable=False)
	name = models.CharField(max_length=50, unique=True, db_index=True)
	description = RichTextField(blank=True, null=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = "roles"
		ordering = ["-created_at"]
		indexes = [
		    models.Index(fields=["name"]),
		]

	def __str__(self):
	    return self.name


class FamilyMembership(models.Model):
	uuid = models.UUIDField(default=uuid.uuid4, editable=False)
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, unique=True, null=False, blank=False, related_name="family_memberships")
	family = models.ForeignKey(Family,on_delete=models.CASCADE, null=False, blank=False, related_name="members")
	role = models.ForeignKey(Role,on_delete=models.SET_NULL,null=True,related_name="role_members")
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = "family_members"
		ordering = ["-created_at"]
		unique_together = ("user", "family")  # prevent duplicate memberships
		indexes = [
		    models.Index(fields=["user"]),
		    models.Index(fields=["family"]),
		    models.Index(fields=["role"]),
		]

	def __str__(self):
	    return f"{self.user.username} - {self.family.name} ({self.role.name if self.role else 'No Role'})"