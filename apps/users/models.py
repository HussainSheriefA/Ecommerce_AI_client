"""
Custom User Model for eCommerce application.

This module defines a custom User model that uses email as the primary identifier
instead of username, with additional fields for eCommerce functionality.
"""
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with email as the primary identifier.
    
    Attributes:
        email: Unique email address used as username
        name: Full name of the user
        phone: Phone number with validation
        is_staff: Designates whether the user can log into admin site
        is_active: Designates whether this user should be treated as active
        date_joined: Timestamp when user account was created
    """
    
    # User type choices
    USER_TYPE_CHOICES = [
        ('customer', 'Customer'),
        ('admin', 'Admin'),
    ]
    
    email = models.EmailField(
        unique=True,
        verbose_name='email address',
        help_text='Unique email address used for authentication'
    )
    name = models.CharField(
        max_length=150,
        verbose_name='full name',
        help_text='User\'s full name'
    )
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(
        validators=[phone_regex],
        max_length=17,
        blank=True,
        verbose_name='phone number'
    )
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='customer',
        verbose_name='user type'
    )
    
    # Status fields
    is_staff = models.BooleanField(
        default=False,
        help_text='Designates whether the user can log into this admin site.'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Designates whether this user should be treated as active.'
    )
    is_verified = models.BooleanField(
        default=False,
        help_text='Designates whether the user has verified their email.'
    )
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Password reset fields
    reset_password_token = models.CharField(max_length=100, blank=True, null=True)
    reset_password_expire = models.DateTimeField(blank=True, null=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['user_type']),
        ]
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        """Return the user's full name."""
        return self.name
    
    def get_short_name(self):
        """Return the user's short name (first name)."""
        return self.name.split()[0] if self.name else self.email


class Address(models.Model):
    """
    User address model for shipping and billing.
    
    Supports multiple addresses per user with one default address.
    """
    
    ADDRESS_TYPE_CHOICES = [
        ('shipping', 'Shipping'),
        ('billing', 'Billing'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses',
        verbose_name='user'
    )
    address_type = models.CharField(
        max_length=10,
        choices=ADDRESS_TYPE_CHOICES,
        default='shipping',
        verbose_name='address type'
    )
    street_address = models.CharField(
        max_length=255,
        verbose_name='street address'
    )
    apartment = models.CharField(
        max_length=50,
        blank=True,
        verbose_name='apartment/suite'
    )
    city = models.CharField(
        max_length=100,
        verbose_name='city'
    )
    state = models.CharField(
        max_length=100,
        verbose_name='state/province'
    )
    postal_code = models.CharField(
        max_length=20,
        verbose_name='postal code'
    )
    country = models.CharField(
        max_length=100,
        default='USA',
        verbose_name='country'
    )
    is_default = models.BooleanField(
        default=False,
        verbose_name='default address'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'address'
        verbose_name_plural = 'addresses'
        db_table = 'addresses'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.street_address[:30]}"
    
    def save(self, *args, **kwargs):
        """Ensure only one default address per type per user."""
        if self.is_default:
            Address.objects.filter(
                user=self.user,
                address_type=self.address_type,
                is_default=True
            ).update(is_default=False)
        super().save(*args, **kwargs)
    
    @property
    def full_address(self):
        """Return formatted full address."""
        parts = [self.street_address]
        if self.apartment:
            parts.append(self.apartment)
        parts.append(f"{self.city}, {self.state} {self.postal_code}")
        parts.append(self.country)
        return ", ".join(parts)
