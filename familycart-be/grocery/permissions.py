from rest_framework import permissions
from rest_framework.exceptions import APIException
from family.models import FamilyMembership, Family
from grocery.models import GroceryList, GroceryItem
from constants.response import KEY_MESSAGE, KEY_PAYLOAD, KEY_STATUS


class FamilyPermissionError(APIException):
    status_code = 403
    default_detail = "You do not have permission."
    default_code = "permission_denied"

    def __init__(self, detail=None):
        if detail is None:
            detail = self.default_detail
        self.detail = {
            KEY_MESSAGE: "error",
            KEY_PAYLOAD: detail,
            KEY_STATUS: 0
        }


class IsFamilyMember(permissions.BasePermission):
    """
    ✅ Global permission that ensures the user belongs to the family membership.
    Works for both GroceryList and GroceryItem ViewSets.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            raise FamilyPermissionError("Authentication required.")

        family_membership_id = None

        # Try to get from request data or query params (for POST, PUT, PATCH)
        family_membership_id = (
            request.data.get("family_membership")
            or request.query_params.get("family_membership")
        )

        # For GroceryItemViewSet, get from grocery_list_id in URL
        grocery_list_id = view.kwargs.get("list_id")
        if grocery_list_id and not family_membership_id:
            try:
                grocery_list = GroceryList.objects.get(id=grocery_list_id)
                family_membership_id = grocery_list.family_membership.id
            except GroceryList.DoesNotExist:
                raise FamilyPermissionError("Invalid grocery list ID.")

        # For object actions, the object check will be done separately.
        # But if we already have family_membership_id, verify user belongs.
        if family_membership_id:
            if not FamilyMembership.objects.filter(id=family_membership_id, user=user).exists():
                raise FamilyPermissionError("You are not authorized for this family.")
        return True

    def has_object_permission(self, request, view, obj):
        """
        Runs for retrieve/update/delete — verifies user belongs to that object's family.
        """
        user = request.user

        if isinstance(obj, GroceryList):
            family_membership_id = obj.family_membership.id
        elif isinstance(obj, GroceryItem):
            family_membership_id = obj.grocery_list.family_membership.id
        else:
            raise FamilyPermissionError("Invalid object type for family check.")

        if not FamilyMembership.objects.filter(id=family_membership_id, user=user).exists():
            raise FamilyPermissionError("You are not authorized to access this resource.")

        return True
