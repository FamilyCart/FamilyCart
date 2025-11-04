from django.urls import path, include
from rest_framework import routers
from user import views

urlpatterns = [
	path('login', views.LoginWithOTPAPIView.as_view(), name='login-with-password'),
    path('signup', views.SignUpAPIViewAPIView.as_view(), name='sign-up'),
    path('verify_otp', views.VerifyOTPAPIView.as_view(), name='verify-email'),
    path('resend_mail', views.SendVerificationMailAPIView.as_view(), name='resend-email'),
    path('profile', views.FetchProfileAPIView.as_view(), name='get-profile'),
]