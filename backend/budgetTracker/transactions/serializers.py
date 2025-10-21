from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Transaction, Budget
from decimal import Decimal

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    transaction_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'created_at', 'transaction_count']
        read_only_fields = ['id', 'created_at']
    
    def get_transaction_count(self, obj):
        """Return count of transactions in this category"""
        return obj.transactions.count()
    
    def validate(self, data):
        """Validate category data"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            data['user'] = request.user
        return data
    
    def create(self, validated_data):
        """Create category with current user"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'type', 'amount', 'description', 'date',
            'category', 'category_name', 'category_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_amount(self, value):
        """Ensure amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value
    
    def validate_category(self, value):
        """Ensure category belongs to current user"""
        request = self.context.get('request')
        if value and value.user != request.user:
            raise serializers.ValidationError("Invalid category")
        return value
    
    def validate(self, data):
        """Cross-field validation"""
        category = data.get('category')
        transaction_type = data.get('type')
        
        if category and category.type != transaction_type:
            raise serializers.ValidationError({
                'category': f"Category type must be {transaction_type}"
            })
        
        return data
    
    def create(self, validated_data):
        """Create transaction with current user"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class BudgetSerializer(serializers.ModelSerializer):
    """Serializer for Budget model"""
    actual_expenses = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    percentage_used = serializers.SerializerMethodField()
    
    class Meta:
        model = Budget
        fields = [
            'id', 'month', 'amount', 'actual_expenses',
            'remaining', 'percentage_used',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_actual_expenses(self, obj):
        """Get actual expenses for the month"""
        return float(obj.get_actual_expenses())
    
    def get_remaining(self, obj):
        """Get remaining budget"""
        return float(obj.get_remaining())
    
    def get_percentage_used(self, obj):
        """Get percentage of budget used"""
        return round(obj.get_percentage_used(), 2)
    
    def validate_amount(self, value):
        """Ensure budget amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Budget amount must be greater than 0")
        return value
    
    def validate_month(self, value):
        """Ensure month is first day of month"""
        if value.day != 1:
            raise serializers.ValidationError("Month must be the first day of the month")
        return value
    
    def create(self, validated_data):
        """Create budget with current user"""
        request = self.context.get('request')
        validated_data['user'] = request.user
        return super().create(validated_data)


class DashboardSerializer(serializers.Serializer):
    """Serializer for dashboard summary data"""
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    monthly_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_month_budget = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        allow_null=True
    )
    budget_remaining = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        allow_null=True
    )
    
    income_by_category = serializers.ListField(child=serializers.DictField())
    expenses_by_category = serializers.ListField(child=serializers.DictField())
    
    recent_transactions = TransactionSerializer(many=True, read_only=True)