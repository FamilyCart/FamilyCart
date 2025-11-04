from django.urls import path, include
from rest_framework.routers import DefaultRouter
from grocery.views import GroceryListViewSet, GroceryItemAPIView

# Router for GroceryList (still using ViewSet)
router = DefaultRouter()
router.register(r'grocery-lists', GroceryListViewSet, basename='grocerylist')

urlpatterns = [
    # GroceryList CRUD (ViewSet)
    path('', include(router.urls)),

    # GroceryItem CRUD (APIView)
    path('grocery-items/', GroceryItemAPIView.as_view(), name='grocery-item-list-create'),
    path('grocery-items/<int:grocery_item_id>/', GroceryItemAPIView.as_view(), name='grocery-item-detail'),
]
