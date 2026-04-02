from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from .models import Address
import re

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'user_type', 'is_verified', 'date_joined']
        read_only_fields = ['id', 'is_verified', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'name', 'phone', 'password', 'password_confirm']
    
    def validate_email(self, value):
        """Validate email format and check if it already exists."""
        try:
            validate_email(value)
        except serializers.ValidationError:
            raise serializers.ValidationError('Invalid email format')
        
        # Check if email already exists
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered')
        
        return value.lower().strip()
    
    def validate_name(self, value):
        """Validate name field."""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError('Name must be at least 2 characters long')
        return value.strip()
    
    def validate_password(self, value):
        """Validate password strength."""
        if len(value) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long')
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError('Password must contain at least one uppercase letter')
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError('Password must contain at least one lowercase letter')
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError('Password must contain at least one number')
        
        return value

    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return attrs

    def create(self, validated_data):
        """Create user with validated data."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
