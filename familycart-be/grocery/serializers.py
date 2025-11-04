from rest_framework import serializers
from rest_framework.serializers import (ModelSerializer,
                                        )
from grocery.models import *

class GroceryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroceryList
        fields = "__all__"
        read_only_fields = ["uuid", "created_by", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value


class GroceryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroceryItem
        fields = "__all__"
        read_only_fields = ["uuid", "created_by", "created_at", "updated_at"]

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value