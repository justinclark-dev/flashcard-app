"""
User model for the Study Notes & Flashcard App.
Extends Django's AbstractUser.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Uses all default fields from AbstractUser:
    - username (unique, required)
    - email (unique, optional)
    - password (hashed, required)
    - first_name, last_name (optional)
    - is_active, is_staff, is_superuser (boolean flags)
    - date_joined, last_login (datetime fields)
    """
    email = models.EmailField(unique=True, blank=True, null=True)
    
    class Meta:
        db_table = 'auth_user'

