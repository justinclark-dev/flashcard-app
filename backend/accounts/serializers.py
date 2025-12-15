"""
Serializers for authentication endpoints.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm')
        extra_kwargs = {
            'email': {'required': False},
        }

    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': ['Passwords do not match.']
            })
        return attrs

    def validate_password(self, value):
        """Validate password meets requirements."""
        # Check minimum length
        if len(value) < 8:
            raise serializers.ValidationError(
                'Password must be at least 8 characters long.'
            )
        
        # Check maximum length
        if len(value) > 128:
            raise serializers.ValidationError(
                'Password must be no more than 128 characters long.'
            )
        
        # Check contains at least one letter
        if not any(c.isalpha() for c in value):
            raise serializers.ValidationError(
                'Password must contain at least one letter.'
            )
        
        # Check contains at least one number
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError(
                'Password must contain at least one number.'
            )
        
        return value

    def create(self, validated_data):
        """Create and return a new user."""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user data (read-only, excludes sensitive fields)."""
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'date_joined')
        read_only_fields = ('id', 'username', 'email', 'date_joined')

