from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.utils import timezone
from django.core.cache import cache
from datetime import datetime, date, timedelta
from decimal import Decimal

from .models import Category, Transaction, Budget
from .serializers import (
    CategorySerializer, TransactionSerializer,
    BudgetSerializer, UserSerializer, DashboardSerializer
)
from .permissions import IsOwner
from .filters import TransactionFilter


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing categories
    Provides: list, create, retrieve, update, destroy
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'type']
    ordering = ['name']
    
    def get_queryset(self):
        """Return categories for current user only"""
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Save category with current user"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def create_defaults(self, request):
        """Create default categories for user"""
        default_categories = [
            {'name': 'Salary', 'type': 'INCOME'},
            {'name': 'Freelance', 'type': 'INCOME'},
            {'name': 'Investment', 'type': 'INCOME'},
            {'name': 'Other Income', 'type': 'INCOME'},
            {'name': 'Groceries', 'type': 'EXPENSE'},
            {'name': 'Rent', 'type': 'EXPENSE'},
            {'name': 'Utilities', 'type': 'EXPENSE'},
            {'name': 'Transportation', 'type': 'EXPENSE'},
            {'name': 'Entertainment', 'type': 'EXPENSE'},
            {'name': 'Healthcare', 'type': 'EXPENSE'},
            {'name': 'Shopping', 'type': 'EXPENSE'},
            {'name': 'Other Expense', 'type': 'EXPENSE'},
        ]
        
        created_categories = []
        for cat_data in default_categories:
            category, created = Category.objects.get_or_create(
                user=request.user,
                name=cat_data['name'],
                type=cat_data['type']
            )
            if created:
                created_categories.append(category)
        
        serializer = self.get_serializer(created_categories, many=True)
        return Response({
            'message': f'Created {len(created_categories)} default categories',
            'categories': serializer.data
        })


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing transactions
    Provides full CRUD + filtering
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'category__name']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date', '-created_at']
    
    def get_queryset(self):
        """Return transactions for current user with custom filtering"""
        queryset = Transaction.objects.filter(
            user=self.request.user
        ).select_related('category', 'user').order_by('-date', '-created_at')
        
        # Manual filtering from query parameters
        transaction_type = self.request.query_params.get('type', None)
        category_id = self.request.query_params.get('category', None)
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        amount_min = self.request.query_params.get('amount_min', None)
        amount_max = self.request.query_params.get('amount_max', None)
        month = self.request.query_params.get('month', None)
        year = self.request.query_params.get('year', None)
        
        # Apply filters
        if transaction_type:
            queryset = queryset.filter(type=transaction_type)
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        if amount_min:
            queryset = queryset.filter(amount__gte=amount_min)
        
        if amount_max:
            queryset = queryset.filter(amount__lte=amount_max)
        
        if month:
            queryset = queryset.filter(date__month=month)
        
        if year:
            queryset = queryset.filter(date__year=year)
        
        return queryset
    
    def perform_create(self, serializer):
        """Save transaction with current user"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get transaction summary statistics"""
        user_id = request.user.id
        cache_key = f'transaction_summary_{user_id}'
        
        # Try to get cached data
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
            
        queryset = self.get_queryset()
        
        # Get all totals in a single query
        totals = queryset.values('type').annotate(
            total=Sum('amount')
        ).order_by('type')
        
        # Initialize values
        income_total = Decimal('0.00')
        expense_total = Decimal('0.00')
        
        # Process totals
        for total in totals:
            if total['type'] == 'INCOME':
                income_total = total['total'] or Decimal('0.00')
            elif total['type'] == 'EXPENSE':
                expense_total = total['total'] or Decimal('0.00')
        
        response_data = {
            'total_income': income_total,
            'total_expenses': expense_total,
            'balance': income_total - expense_total,
            'transaction_count': queryset.count()
        }
        
        # Cache the results for 5 minutes
        cache.set(cache_key, response_data, 300)
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get transactions grouped by category"""
        queryset = self.get_queryset()
        
        income_by_cat = queryset.filter(type='INCOME').values(
            'category__name'
        ).annotate(total=Sum('amount')).order_by('-total')
        
        expense_by_cat = queryset.filter(type='EXPENSE').values(
            'category__name'
        ).annotate(total=Sum('amount')).order_by('-total')
        
        return Response({
            'income_by_category': list(income_by_cat),
            'expenses_by_category': list(expense_by_cat)
        })


class BudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing budgets
    """
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['month', 'amount']
    ordering = ['-month']
    
    def get_queryset(self):
        """Return budgets for current user only"""
        return Budget.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Save budget with current user"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current month's budget"""
        today = date.today()
        current_month = date(today.year, today.month, 1)
        
        try:
            budget = Budget.objects.get(
                user=request.user,
                month=current_month
            )
            serializer = self.get_serializer(budget)
            return Response(serializer.data)
        except Budget.DoesNotExist:
            return Response({
                'message': 'No budget set for current month',
                'month': current_month
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def set_current(self, request):
        """Set or update current month's budget"""
        today = date.today()
        current_month = date(today.year, today.month, 1)
        
        amount = request.data.get('amount')
        if not amount:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        budget, created = Budget.objects.update_or_create(
            user=request.user,
            month=current_month,
            defaults={'amount': amount}
        )
        
        serializer = self.get_serializer(budget)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    """
    Get comprehensive dashboard data
    """
    user = request.user
    today = date.today()
    current_month = date(today.year, today.month, 1)
    
    # All transactions with optimized querying
    all_transactions = (
        Transaction.objects.filter(user=user)
        .select_related('category')
        .only('id', 'amount', 'type', 'date', 'category__name')
    )
    
    # Current month transactions
    month_transactions = all_transactions.filter(
        date__year=today.year,
        date__month=today.month
    )
    
    # Calculate totals with a single query for all transactions
    transaction_totals = all_transactions.values('type').annotate(
        total=Sum('amount')
    ).order_by('type')
    
    # Calculate monthly totals with a single query
    monthly_totals = month_transactions.values('type').annotate(
        total=Sum('amount')
    ).order_by('type')
    
    # Initialize values
    total_income = Decimal('0.00')
    total_expenses = Decimal('0.00')
    monthly_income = Decimal('0.00')
    monthly_expenses = Decimal('0.00')
    
    # Process totals
    for total in transaction_totals:
        if total['type'] == 'INCOME':
            total_income = total['total'] or Decimal('0.00')
        elif total['type'] == 'EXPENSE':
            total_expenses = total['total'] or Decimal('0.00')
            
    for total in monthly_totals:
        if total['type'] == 'INCOME':
            monthly_income = total['total'] or Decimal('0.00')
        elif total['type'] == 'EXPENSE':
            monthly_expenses = total['total'] or Decimal('0.00')
    
    # Get category breakdowns with a single query
    category_totals = (
        all_transactions
        .values('type', 'category__name')
        .annotate(total=Sum('amount'))
        .order_by('type', '-total')
    )
    
    # Separate income and expenses
    income_by_category = [
        {'category__name': item['category__name'], 'total': item['total']}
        for item in category_totals
        if item['type'] == 'INCOME'
    ]
    
    expenses_by_category = [
        {'category__name': item['category__name'], 'total': item['total']}
        for item in category_totals
        if item['type'] == 'EXPENSE'
    ]
    
    # Get current budget with error handling
    current_budget = None
    budget_remaining = None
    try:
        budget = Budget.objects.select_related('user').get(
            user=user,
            month=current_month
        )
        current_budget = budget.amount
        try:
            budget_remaining = budget.get_remaining()
        except Exception as e:
            # Log the error but don't fail the entire request
            print(f"Error calculating budget remaining: {str(e)}")
            budget_remaining = current_budget
    except Budget.DoesNotExist:
        pass
    except Exception as e:
        print(f"Error fetching budget: {str(e)}")
        # Continue with None values for budget fields
    
    # Recent transactions
    recent_transactions = all_transactions.order_by('-date', '-created_at')[:10]
    
    # Prepare response data
    data = {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'balance': total_income - total_expenses,
        'monthly_income': monthly_income,
        'monthly_expenses': monthly_expenses,
        'current_month_budget': current_budget,
        'budget_remaining': budget_remaining,
        'income_by_category': income_by_category,
        'expenses_by_category': expenses_by_category,
        'recent_transactions': TransactionSerializer(
            recent_transactions, 
            many=True
        ).data
    }
    
    serializer = DashboardSerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)