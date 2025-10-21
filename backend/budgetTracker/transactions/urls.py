from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    dashboard_view,
    user_profile_view
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')

# URL patterns
urlpatterns = [
    # Router URLs (includes all CRUD operations)
    path('', include(router.urls)),
    
    # Custom endpoints
    path('dashboard/', dashboard_view, name='dashboard'),
    path('profile/', user_profile_view, name='profile'),
]