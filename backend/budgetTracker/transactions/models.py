from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal

class Category(models.Model):
    """
    Categories for income and expenses
    Each user can have their own categories
    """
    INCOME = 'INCOME'
    EXPENSE = 'EXPENSE'
    
    TYPE_CHOICES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=10, 
        choices=TYPE_CHOICES
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
        unique_together = ['user', 'name', 'type']
    
    def __str__(self):
        return f"{self.name} ({self.type})"


class Transaction(models.Model):
    """
    Income and Expense transactions
    """
    INCOME = 'INCOME'
    EXPENSE = 'EXPENSE'
    
    TYPE_CHOICES = [
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions'
    )
    type = models.CharField(
        max_length=10,
        choices=TYPE_CHOICES
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    description = models.TextField(blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'type']),
            models.Index(fields=['user', 'category']),
        ]
    
    def __str__(self):
        return f"{self.type}: {self.amount} - {self.description[:30]}"


class Budget(models.Model):
    """
    Monthly budget for users
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    month = models.DateField(
        help_text="First day of the month"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-month']
        unique_together = ['user', 'month']
    
    def __str__(self):
        return f"Budget for {self.month.strftime('%B %Y')}: ${self.amount}"
    
    def get_actual_expenses(self):
        """Calculate actual expenses for this budget month"""
        from django.db.models import Sum
        
        expenses = Transaction.objects.filter(
            user=self.user,
            type=Transaction.EXPENSE,
            date__year=self.month.year,
            date__month=self.month.month
        ).aggregate(total=Sum('amount'))
        
        return expenses['total'] or Decimal('0.00')
    
    def get_remaining(self):
        """Calculate remaining budget"""
        return self.amount - self.get_actual_expenses()
    
    def get_percentage_used(self):
        """Calculate percentage of budget used"""
        actual = self.get_actual_expenses()
        if self.amount > 0:
            return float((actual / self.amount) * 100)
        return 0.0