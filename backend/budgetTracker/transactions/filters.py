import django_filters
from .models import Transaction

class TransactionFilter(django_filters.FilterSet):
    """
    Filter for transactions with multiple options
    """
    date_from = django_filters.DateFilter(field_name='date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date', lookup_expr='lte')

    amount_min = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')

    type = django_filters.ChoiceFilter(choices=Transaction.TYPE_CHOICES)
    category = django_filters.NumberFilter(field_name='category__id')

    description = django_filters.CharFilter(lookup_expr='icontains')

    month = django_filters.NumberFilter(field_name='date', lookup_expr='month')
    year = django_filters.NumberFilter(field_name='date', lookup_expr='year')
    
    class Meta:
        model = Transaction
        fields = [
            'type', 'category', 'date_from', 'date_to',
            'amount_min', 'amount_max', 'description',
            'month', 'year'
        ]