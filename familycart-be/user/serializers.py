from rest_framework import serializers
from rest_framework.serializers import (ModelSerializer,
                                        )
from user.models import *
from django.contrib.auth.password_validation import validate_password
from family.scripts import *

class EmailLoginSerializer(ModelSerializer):
    """ Login Serializer """

    class Meta:
        model = User
        fields = ['email', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': True},
            'email': {'required': True}
        }

class UserSimpleSerializer(ModelSerializer):
    """ User Basic Information Serializer """
    family_membership = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'uuid', 'gender', 'family_membership','email', 'is_admin','username', 'first_name', 'last_name', 'email_verified')
        extra_kwargs = {
            'username': {'required': False},  # Allow username updates if necessary
            'email': {'read_only': True},  # Prevent users from updating email
        }

    def get_family_membership(self, obj):
        return fetch_my_family_membership(obj)


    
