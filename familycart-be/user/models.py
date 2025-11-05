import pytz
import random
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser
)
from django.core.validators import ValidationError
from django.db import models
from rest_framework_simplejwt.tokens import RefreshToken
from math import sin, cos, sqrt, atan2, radians
from ckeditor.fields import RichTextField
import string
import uuid
from django.utils import timezone
from django.utils.text import slugify


utc = pytz.UTC


class UserManager(BaseUserManager):
    def create_user(self, username, password):
        """
        Creates and saves a User with the given email and password.
        """
        if not username:
            raise ValueError('Users must have an email address')

        user = self.model(
            username=self.normalize_email(username),
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password):
        """
        Creates and saves a superuser with the given email and password.
        """
        user = self.create_user(
            username=username,
            password=password,
        )
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
	GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
	def save(self, *args, **kwargs):
		if self.pk == None:
			if not (self.email == None or self.email == ""):
				if User.objects.filter(email=self.email).exists():
					return ValidationError("User Already Exist in  this mail id")

			if (self.username == None or self.username == ""):
				email = self.email
				if email and not self.username:
					mail_id = email.split("@")[0].lower()
					if User.objects.filter(username=mail_id).exists():
						uid = User.objects.last().id + 1
						self.username = f"{mail_id}_{uid}"
					else:
						self.username = f"{mail_id}"

			self.username = self.username.lower()
			if self.email:
				self.email = self.email.lower()
		super(User, self).save(*args, **kwargs)


	uuid = models.UUIDField(default=uuid.uuid4, editable=False)
	username = models.CharField(max_length=255, unique=True, blank=False, null=False, )
	email = models.EmailField(blank=True, null=True, unique=True, db_index=True)
	first_name = models.CharField(max_length=255, unique=False, blank=False, null=False, )
	last_name = models.CharField(max_length=255, unique=False, blank=False, null=False, )
	email_otp = models.IntegerField(blank=True, null=True,)
	email_otp_validity = models.DateTimeField(blank=True, null=True,)
	email_verified = models.BooleanField(default=False)
	bio = RichTextField(blank = True)
	gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
	is_active = models.BooleanField(default=True)
	is_admin = models.BooleanField(default=False)
	is_staff = models.BooleanField(default=False)
	is_superuser = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	groups = models.ManyToManyField('auth.Group', blank=True, related_name="cutom_user_group")

	objects = UserManager()

	USERNAME_FIELD = "username"

	# REQUIRED_FIELDS = ["username"]

	def save(self, *args, **kwargs):
		if not self.username:
			self.username = self.generate_creative_username()

		super(User, self).save(*args, **kwargs)


	def has_perm(self, perm, obj=None):
	    user_perms = []
	    if self.is_staff:
	        groups = self.groups.all()
	        for group in groups:
	            perms = [(f"{x.content_type.app_label}.{x.codename}") for x in group.permissions.all()]
	            user_perms += perms

	        if perm in user_perms:
	            return True
	    return (self.is_admin or self.is_superuser)

	def has_module_perms(self, app_label):
	    "Does the user have permissions to view the app `app_label`?"
	    return True

	def get_tokens_for_user(self):
	    refresh = RefreshToken.for_user(self)
	    data = {
	        'refresh': str(refresh),
	        'access': str(refresh.access_token),
	    }	
	    return data

	def generate_creative_username(self):
	    """
	    Generate a short, unique username (max 10 chars).
	    Uses first name or email prefix and appends a random string.
	    """
	    base_name = slugify(self.first_name or (self.email.split('@')[0] if self.email else 'user'))[:6]

	    def random_suffix():
	        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=3))

	    username = f"{base_name}{random_suffix()}"[:10]

	    # Ensure uniqueness
	    while User.objects.filter(username=username).exists():
	        username = f"{base_name}{random_suffix()}"[:10]

	    return username.lower()
	    

class EmailVerification(models.Model):
	uuid = models.UUIDField(default=uuid.uuid4, editable=False)
	email_to = models.ForeignKey(User, on_delete=models.CASCADE, null = False, blank = False)
	verification_otp = models.CharField(max_length=255, blank=False, null=False, )
	validity = models.DateTimeField(blank=True, null=True, )

	def validate_email(self, email_to, verification_otp):
		# Checking if the email and verification token match the instance
		valid = (self.email_to == email_to and 
				self.verification_otp == verification_otp and 
				self.validity >= timezone.now())
		# Deleting the instance if validation is successful
		if valid:
			self.delete()
		return valid