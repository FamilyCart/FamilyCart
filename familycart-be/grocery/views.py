# Library Import
from rest_framework import status
from rest_framework.viewsets import *
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,IsAdminUser,
)
from rest_framework.response import Response
# Local Import
from grocery.models import *
from grocery.serializers import *
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.settings import api_settings
from django.db.models import Q
from datetime import datetime, timedelta, date
from constants.response import KEY_MESSAGE, KEY_PAYLOAD, KEY_STATUS
from constants.commons import handle_exceptions
from django.conf import settings
from notification.scripts import *
from grocery.permissions import *
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView

class GroceryListViewSet(ModelViewSet):
    """
    CRUD operations for GroceryList with consistent API response structure.
    """
    serializer_class = GroceryListSerializer
    permission_classes = [IsAuthenticated, IsFamilyMember]
    queryset = GroceryList.objects.all().select_related("family_membership", "created_by")

    def get_queryset(self):
        """
        Limit grocery lists to those belonging to families
        the authenticated user is a member of.
        """
        user = self.request.user
        memberships = FamilyMembership.objects.filter(user=user)
        return GroceryList.objects.filter(family_membership__in=memberships)

    @handle_exceptions
    def perform_create(self, serializer):
        """Attach created_by automatically to the current user."""
        serializer.save(created_by=self.request.user)

    # List Grocery List Objs
    @handle_exceptions
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                KEY_MESSAGE: "success",
                KEY_PAYLOAD: serializer.data,
                KEY_STATUS: 1
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            KEY_MESSAGE: "success",
            KEY_PAYLOAD: serializer.data,
            KEY_STATUS: 1
        }, status=status.HTTP_200_OK)

    # Fetch Grocery List Objs
    @handle_exceptions
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            KEY_MESSAGE: "success",
            KEY_PAYLOAD: serializer.data,
            KEY_STATUS: 1
        }, status=status.HTTP_200_OK)

    # Create Grocery List Objs
    @handle_exceptions
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Mandatory field validation
        missing_fields = [f for f in ["name", "family_membership"] if not serializer.validated_data.get(f)]
        if missing_fields:
            return Response({
                KEY_MESSAGE: "error",
                KEY_PAYLOAD: f"Missing mandatory fields: {', '.join(missing_fields)}",
                KEY_STATUS: 0
            }, status=status.HTTP_400_BAD_REQUEST)

        # Family membership authorization
        family_membership = serializer.validated_data.get("family_membership")
        if not FamilyMembership.objects.filter(id=family_membership.id, user=request.user).exists():
            return Response({
                KEY_MESSAGE: "error",
                KEY_PAYLOAD: "You are not authorized to create a list for this family.",
                KEY_STATUS: 0
            }, status=status.HTTP_403_FORBIDDEN)

        # Save record
        self.perform_create(serializer)
        return Response({
            KEY_MESSAGE: "success",
            KEY_PAYLOAD: serializer.data,
            KEY_STATUS: 1
        }, status=status.HTTP_201_CREATED)

    # Update Grocery List Objs
    @handle_exceptions
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            KEY_MESSAGE: "success",
            KEY_PAYLOAD: serializer.data,
            KEY_STATUS: 1
        }, status=status.HTTP_200_OK)

    # Delete Grocery List Objs
    @handle_exceptions
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            KEY_MESSAGE: "success",
            KEY_PAYLOAD: "Grocery list deleted successfully.",
            KEY_STATUS: 1
        }, status=status.HTTP_200_OK)


class GroceryItemPagination(PageNumberPagination):
    """Custom pagination for grocery items"""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class GroceryItemAPIView(APIView):
	"""
	Handles GET (list), POST (create), PUT/PATCH (update), DELETE for GroceryItems.
	grocery_list_id is passed in query params: ?grocery_list_id=1
	"""
	permission_classes = [IsAuthenticated, IsFamilyMember]
	pagination_class = GroceryItemPagination

	@handle_exceptions
	def get(self, request, *args, **kwargs):
	    """List all grocery items for a given grocery list"""
	    user = request.user
	    grocery_list_id = request.query_params.get("grocery_list_id")

	    if not grocery_list_id:
	        return Response({
	            KEY_MESSAGE: "error",
	            KEY_PAYLOAD: "grocery_list_id query param is required.",
	            KEY_STATUS: 0
	        }, status=status.HTTP_400_BAD_REQUEST)

	    items = GroceryItem.objects.filter(
	        grocery_list__id=grocery_list_id,
	        grocery_list__family_membership__user=user
	    ).select_related("grocery_list", "created_by")

	    paginator = self.pagination_class()
	    paginated_items = paginator.paginate_queryset(items, request)
	    serializer = GroceryItemSerializer(paginated_items, many=True)

	    return paginator.get_paginated_response({
	        KEY_MESSAGE: "success",
	        KEY_PAYLOAD: serializer.data,
	        KEY_STATUS: 1
	    })

	@handle_exceptions
	def post(self, request, *args, **kwargs):
		"""Create a new grocery item"""
		user = request.user
		grocery_list_id = request.query_params.get("grocery_list_id")

		if not grocery_list_id:
		    return Response({
		        KEY_MESSAGE: "error",
		        KEY_PAYLOAD: "grocery_list_id query param is required.",
		        KEY_STATUS: 0
		    }, status=status.HTTP_400_BAD_REQUEST)

		# Validate grocery list ownership
		try:
		    grocery_list = GroceryList.objects.get(
		        id=grocery_list_id,
		        family_membership__user=user
		    )
		except GroceryList.DoesNotExist:
		    return Response({
		        KEY_MESSAGE: "error",
		        KEY_PAYLOAD: "You are not authorized to access this grocery list.",
		        KEY_STATUS: 0
		    }, status=status.HTTP_403_FORBIDDEN)

		# Validate mandatory fields
		data = request.data
		missing_fields = [f for f in ["name", "quantity", "quantity_type"] if not data.get(f)]
		if missing_fields:
			return Response({
			    KEY_MESSAGE: "error",
			    KEY_PAYLOAD: f"Missing mandatory fields: {', '.join(missing_fields)}",
			    KEY_STATUS: 0
			}, status=status.HTTP_400_BAD_REQUEST)
		data = request.data.copy()
		data["grocery_list"] = grocery_list.id
		serializer = GroceryItemSerializer(data=data)
		if serializer.is_valid():
		    serializer.save(grocery_list=grocery_list, created_by=user)
		    return Response({
		        KEY_MESSAGE: "success",
		        KEY_PAYLOAD: serializer.data,
		        KEY_STATUS: 1
		    }, status=status.HTTP_201_CREATED)
		else:
		    return Response({
		        KEY_MESSAGE: "error",
		        KEY_PAYLOAD: serializer.errors,
		        KEY_STATUS: 0
		    }, status=status.HTTP_400_BAD_REQUEST)

	@handle_exceptions
	def put(self, request, grocery_item_id, *args, **kwargs):
		"""Full update of a grocery item"""
		user = request.user
		try:
			grocery_item = GroceryItem.objects.get(id=grocery_item_id)
			data = request.data.copy()
			data["grocery_list"] = grocery_item.grocery_list.id
		except GroceryItem.DoesNotExist:
		    return Response({
		        KEY_MESSAGE: "error",
		        KEY_PAYLOAD: "Item not found or not authorized.",
		        KEY_STATUS: 0
		    }, status=status.HTTP_404_NOT_FOUND)

		serializer = GroceryItemSerializer(grocery_item, data=data)
		if serializer.is_valid():
		    serializer.save()
		    return Response({
		        KEY_MESSAGE: "success",
		        KEY_PAYLOAD: serializer.data,
		        KEY_STATUS: 1
		    }, status=status.HTTP_200_OK)
		else:
		    return Response({
		        KEY_MESSAGE: "error",
		        KEY_PAYLOAD: serializer.errors,
		        KEY_STATUS: 0
		    }, status=status.HTTP_400_BAD_REQUEST)

	@handle_exceptions
	def patch(self, request, grocery_item_id, *args, **kwargs):
	    """Partial update"""
	    user = request.user
	    try:
	        instance = GroceryItem.objects.get(id=grocery_item_id, grocery_list__family_membership__user=user)
	    except GroceryItem.DoesNotExist:
	        return Response({
	            KEY_MESSAGE: "error",
	            KEY_PAYLOAD: "Item not found or not authorized.",
	            KEY_STATUS: 0
	        }, status=status.HTTP_404_NOT_FOUND)

	    serializer = GroceryItemSerializer(instance, data=request.data, partial=True)
	    if serializer.is_valid():
	        serializer.save()
	        return Response({
	            KEY_MESSAGE: "success",
	            KEY_PAYLOAD: serializer.data,
	            KEY_STATUS: 1
	        }, status=status.HTTP_200_OK)
	    else:
	        return Response({
	            KEY_MESSAGE: "error",
	            KEY_PAYLOAD: serializer.errors,
	            KEY_STATUS: 0
	        }, status=status.HTTP_400_BAD_REQUEST)

	@handle_exceptions
	def delete(self, request, grocery_item_id, *args, **kwargs):
	    """Delete grocery item"""
	    user = request.user
	    try:
	        instance = GroceryItem.objects.get(id=grocery_item_id, grocery_list__family_membership__user=user)
	    except GroceryItem.DoesNotExist:
	        return Response({
	            KEY_MESSAGE: "error",
	            KEY_PAYLOAD: "Item not found or not authorized.",
	            KEY_STATUS: 0
	        }, status=status.HTTP_404_NOT_FOUND)

	    instance.delete()
	    return Response({
	        KEY_MESSAGE: "success",
	        KEY_PAYLOAD: "Item deleted successfully.",
	        KEY_STATUS: 1
	    }, status=status.HTTP_200_OK)