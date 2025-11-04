# Library Import
from rest_framework import status
from rest_framework.generics import (
    GenericAPIView,
    UpdateAPIView,
    CreateAPIView,
    ListAPIView
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,IsAdminUser,
)
from rest_framework.response import Response
from rest_framework.views import APIView
# Local Import
from user.models import *
from user.serializers import *
from user.scripts import *
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.settings import api_settings
from django.db.models import Q
from datetime import datetime, timedelta, date
from constants.response import KEY_MESSAGE, KEY_PAYLOAD, KEY_STATUS
from constants.commons import handle_exceptions
from django.conf import settings
from notification.scripts import *
from family.serializers import *


class JoinFamilyAPIView(APIView):
    """Join or create a family"""
    permission_classes = [IsAuthenticated]

    @handle_exceptions
    def post(self, request):
        serializer = JoinFamilySerializer(data=request.data)
        family_created = False

        # Validate serializer
        if not serializer.is_valid():
            return Response(
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                data={
                    KEY_MESSAGE: "error",
                    KEY_PAYLOAD: serializer.errors,
                    KEY_STATUS: 0
                }
            )

        user = request.user
        family_code = serializer.validated_data.get("family_code", "").strip()
        family_name = serializer.validated_data.get("family_name", "").strip()

        # ✅ Check if user already belongs to a family
        existing_membership = FamilyMembership.objects.filter(user=user).first()
        if existing_membership:
            return Response(
                status=status.HTTP_400_BAD_REQUEST,
                data={
                    KEY_MESSAGE: "error",
                    KEY_PAYLOAD: "User already belongs to a family. Leave the current family before joining or creating another.",
                    KEY_STATUS: 0
                }
            )

        # Join existing family
        if family_code:
            try:
                family = Family.objects.get(family_code=family_code)
            except Family.DoesNotExist:
                return Response(
                    status=status.HTTP_404_NOT_FOUND,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Family with this code does not exist.",
                        KEY_STATUS: 0
                    }
                )

        # Create new family and join
        else:
            family = Family.objects.create(
                name=family_name,
                family_code=str(uuid.uuid4())[:6].upper()  # generate unique 6-char code
            )
            family_created = True

        # Add user to family
        membership = FamilyMembership.objects.create(user=user, family=family)
        membership.role = Role.objects.get(name="owner" if family_created else "member")
        membership.save()

        return Response(
            status=status.HTTP_200_OK,
            data={
                KEY_MESSAGE: "success",
                KEY_PAYLOAD: FamilyMembershipSerializer(membership).data,
                KEY_STATUS: 1
            }
        )
class MyFamiliesAPIView(APIView):
	"""List family"""
	permission_classes = [IsAuthenticated]

	@handle_exceptions
	def get(self, request):
		user = request.user
		# Get all memberships of the current user
		memberships = FamilyMembership.objects.select_related('family', 'role').filter(user=user)
		# Serialize memberships
		serializer = FamilyMembershipSerializer(memberships, many=True)

		return Response(
		    status=status.HTTP_200_OK,
		    data={
		        KEY_MESSAGE: "success",
		        KEY_PAYLOAD: serializer.data,
		        KEY_STATUS: 1
		    }
		)

