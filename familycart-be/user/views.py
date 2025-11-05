# Library Import
from rest_framework import status
from rest_framework import viewsets
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



# Create your views here.
class LoginWithOTPAPIView(GenericAPIView):
    """Custom Login for user to login using password"""

    permission_classes = [AllowAny]
    serializer_class = EmailLoginSerializer

    @handle_exceptions
    def post(self, request):
        email = request.data.get("email", None)
        if not email:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please enter your email!",
                        KEY_STATUS: 0
                    },
                )

        user = User.objects.filter(email = email)
        if user:
            user = user.last()
            # user.set_password(password)
            verification_otp = generate_otp()
            email_verification, created = EmailVerification.objects.get_or_create(email_to = user, verification_otp = verification_otp)
            send_user_sign_up_mail(f"Verify your your {settings.APP_NAME} Account",user.first_name, verification_otp, email)
            user.save()
            return Response(
                    status=status.HTTP_200_OK,
                    data={
                        KEY_MESSAGE: "Sucess",
                        KEY_PAYLOAD: "OTP sent on Mail, Please Verify",
                        KEY_STATUS: 1
                    },
                )
        else:
            return Response(
                    status=status.HTTP_404_NOT_FOUND,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please do Signup!",
                        KEY_STATUS: 0
                    },
                )



class SignUpAPIViewAPIView(APIView):
    """End point For User to SIGNUP with First name, Last Name and Email"""
    permission_classes = [AllowAny]

    # @handle_exceptions
    def post(self, request):
        first_name = request.data.get("first_name", None)
        last_name = request.data.get("last_name", None)
        email = request.data.get("email", None)

        if not email:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please enter your email!",
                        KEY_STATUS: 0
                    },
                )

        if not first_name:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please enter your first name!",
                        KEY_STATUS: 0
                    },
                )

        if not last_name:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please enter your last name!",
                        KEY_STATUS: 0
                    },
                )

        user = User.objects.filter(email = email)
        if user:
            if user.last().email_verified == False:
                return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "User already exists. Please verify your email address to login.",
                        KEY_STATUS: -1
                    },
                )

            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "User already exists. Please login.",
                        KEY_STATUS: -1
                    },
                )

        user = None
        if email:
            user = User.objects.create(email = email, first_name = first_name, last_name = last_name)
            user.email_verified = False
            verification_otp = generate_otp() # generat 4 digit OTP
            EmailVerification.objects.get_or_create(email_to = user, verification_otp = verification_otp)
            send_user_sign_up_mail(f"Verify your your {settings.APP_NAME} Account",user.first_name, verification_otp, email)
            user.save()
            return Response(
                    status=status.HTTP_200_OK,
                    data={
                        KEY_MESSAGE: "Sucess",
                        KEY_PAYLOAD: "Please Check Your Email for OTP Verification.",
                        KEY_STATUS: 1
                    },
                )
        else:
            return Response(
                    status=status.HTTP_400_BAD_REQUEST,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please enter your email!",
                        KEY_STATUS: 0
                    },
                )

class VerifyOTPAPIView(APIView):
    """End point To Verify the OTP. Send (contact_number and country_code[country_code: srt]) or email and otp in parameters"""
    permission_classes = [AllowAny]

    @handle_exceptions
    def get(self, request):
        otp = request.query_params.get("otp")
        email = request.query_params.get("email")

        if not otp:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please provide a otp!",
                        KEY_STATUS: 0
                    },
                )

        user = None
        if otp != None and email != None:
            email_verification = EmailVerification.objects.filter(email_to__email=email)
        else:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please provide a correct otp!",
                        KEY_STATUS: 0
                    },
                )
        if not email_verification:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please make Signup or Forgot Password.",
                        KEY_STATUS: 0
                    },
                )
        user = email_verification.last().email_to
        if user:
            email_verification = email_verification.last()
            if email_verification.validate_email(user, otp):
                if otp:
                    if not user.email_verified:
                        user.email_verified = True
                        user.save()

                res = user.get_tokens_for_user()
                user_serializer = UserSimpleSerializer(user, many=False)
                return Response(
                    status=status.HTTP_200_OK,
                    data={
                        KEY_MESSAGE: "Email verfied successfully.",
                        KEY_PAYLOAD: {"token": res['access'], "user": user_serializer.data},
                        KEY_STATUS: 1
                    },
                )
            else:
                return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "The OTP is Invalid or Expired.", 
                        KEY_STATUS: 0
                    },
                )
        else:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "User doesn't exist!",
                        KEY_STATUS: -1
                    },
                )



class SendVerificationMailAPIView(APIView):
    permission_classes = [AllowAny]

    @handle_exceptions
    def get(self, request):
        email = request.query_params.get("email")
        if not email:
            return Response(
                    status=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    data={
                        KEY_MESSAGE: "error",
                        KEY_PAYLOAD: "Please enter an email!",
                        KEY_STATUS: 0
                    },
                )
        try:
            user = User.objects.get(email = email)
        except Exception as e:
            return Response(
                status=status.HTTP_404_NOT_FOUND,
                data={
                    KEY_MESSAGE: "Error",
                    KEY_PAYLOAD: "Email doesn't exist! Please register first.",
                    KEY_STATUS: 1
                }
            )

        verification_otp = generate_otp()
        email_verification, created = EmailVerification.objects.get_or_create(email_to = user, verification_otp = verification_otp)
        send_user_sign_up_mail(f"Verify your your {settings.APP_NAME} Account",user.first_name, verification_otp, email)
        return Response(
            status=status.HTTP_200_OK,
            data={
                KEY_MESSAGE: "Success",
                KEY_PAYLOAD: "Verification email sent successfully.",
                KEY_STATUS: 1
            }
        )


class FetchProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @handle_exceptions
    def get(self, request):
        """ Fetch the User Data """
        return Response(
                    status=status.HTTP_200_OK,
                    data={
                        KEY_MESSAGE: "Profile fetched successfully",
                        KEY_PAYLOAD: UserSimpleSerializer(request.user, many=False).data,
                        KEY_STATUS: 1
                    },
                )

    @handle_exceptions
    def patch(self, request):
        """ Partial Update User Profile """
        user = request.user
        serializer = UserSimpleSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                status=status.HTTP_200_OK,
                data={
                    KEY_MESSAGE: "Profile updated successfully",
                    KEY_PAYLOAD: serializer.data,
                    KEY_STATUS: 1
                },
            )

        return Response(
            status=status.HTTP_400_BAD_REQUEST,
            data={
                KEY_MESSAGE: "Failed to update profile",
                KEY_PAYLOAD: serializer.errors,
                KEY_STATUS: 0
            },
        )
