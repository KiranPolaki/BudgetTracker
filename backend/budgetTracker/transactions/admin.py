from django.contrib import admin
from .models import Category, Transaction, Budget

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'user', 'created_at']
    list_filter = ['type', 'created_at']
    search_fields = ['name', 'user__username']
    ordering = ['name']

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['date', 'type', 'category', 'amount', 'description', 'user']
    list_filter = ['type', 'date', 'category']
    search_fields = ['description', 'user__username']
    date_hierarchy = 'date'
    ordering = ['-date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'type', 'category')
        }),
        ('Transaction Details', {
            'fields': ('amount', 'description', 'date')
        }),
    )

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['user', 'month', 'amount', 'get_actual_expenses', 'get_remaining']
    list_filter = ['month']
    search_fields = ['user__username']
    date_hierarchy = 'month'
    ordering = ['-month']
    
    readonly_fields = ['get_actual_expenses', 'get_remaining', 'get_percentage_used']
    
    def get_actual_expenses(self, obj):
        return f"${obj.get_actual_expenses()}"
    get_actual_expenses.short_description = 'Actual Expenses'
    
    def get_remaining(self, obj):
        return f"${obj.get_remaining()}"
    get_remaining.short_description = 'Remaining'