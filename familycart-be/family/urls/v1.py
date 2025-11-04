from django.urls import path, include
from rest_framework import routers
from family import views

urlpatterns = [
    path('join', views.JoinFamilyAPIView.as_view(), name='join-family'),
    path('list', views.MyFamiliesAPIView.as_view(), name='family-list'),
]