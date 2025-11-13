import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from django.db import transaction as db_transaction
from .serializers import UserSerializer
from .models import Category
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        
        if User.objects.filter(username=username).exists():
            return Response(
                {'username': 'Username already taken.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'email': 'Email already registered.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = UserSerializer(data=request.data)
        
        if not serializer.is_valid():
            logger.warning(f"Validation failed: {serializer.errors}")
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with db_transaction.atomic():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', '')
            )
            
            logger.info(f"User created successfully: {user.username}")
            
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
            
            for cat_data in default_categories:
                try:
                    Category.objects.get_or_create(
                        user=user,
                        name=cat_data['name'],
                        defaults={'type': cat_data['type']}
                    )
                except Exception as e:
                    logger.error(f"Error creating category {cat_data['name']}: {str(e)}")
            
            logger.info(f"Default categories created for user: {user.username}")
            
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            user_data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
            
            response_data = {
                'user': user_data,
                'tokens': {
                    'refresh': refresh_token,
                    'access': access_token,
                }
            }
            
            logger.info(f"Registration successful for user: {user.username}")
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Unexpected error in register_user: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Registration failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )