from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
from rest_framework.exceptions import APIException
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from django.utils import timezone

class InvalidTokenException(APIException):
    status_code = 401
    default_detail = {
        "detail": "Given token not valid for any token type",
        "code": "token_not_valid",
        "messages": [
            {
                "token_class": "AccessToken",
                "token_type": "access",
                "message": "Token is invalid or expired"
            }
        ]
    }


class IsLoggedInUser(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj == request.user