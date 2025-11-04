from rest_framework import serializers
from rest_framework.serializers import (ModelSerializer,
                                        )
from family.models import *

class JoinFamilySerializer(serializers.Serializer):
    family_code = serializers.CharField(max_length=20,required=False,allow_blank=True,help_text="Provide this to join an existing family.")
    family_name = serializers.CharField(max_length=100,required=False,allow_blank=True,help_text="Provide this to create a new family if no code is given.")

    def validate(self, data):
        family_code = data.get("family_code", "").strip()
        family_name = data.get("family_name", "").strip()

        if not family_code and not family_name:
            raise serializers.ValidationError(
                "Either 'family_code' or 'family_name' must be provided."
            )
        return data

class FamilyMembershipSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    family_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = FamilyMembership
        fields = ['uuid','id','user','username','family','family_name','role','role','created_at','updated_at']
        read_only_fields = ['uuid', 'created_at', 'updated_at']

    def get_username(self, obj):
        return obj.user.username

    def get_family_name(self, obj):
        return obj.family.name

    def get_role(self, obj):
        return obj.role.name

