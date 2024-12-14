from django.db import models 
from django.contrib.auth.models import AbstractUser, AbstractBaseUser, BaseUserManager 
import datetime

class OTP(models.Model):
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    email_otp = models.IntegerField()
    phone_otp = models.IntegerField()
    expires_at = models.DateTimeField()

    def is_valid(self):
        return self.expires_at > datetime.datetime.now()
# Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, contact_number, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        if not contact_number:
            raise ValueError("Contact number is required")

        user = self.model(email=self.normalize_email(email), contact_number=contact_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, contact_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, contact_number, password, **extra_fields)

# Custom User Model
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    user_type = models.CharField(max_length=50, default="user")

    # Specify related_name to avoid conflicts with the default User model
    groups = models.ManyToManyField(
        Group,
        related_name="customuser_set",  # Change the related name
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="customuser_permissions",  # Change the related name
        blank=True,
        help_text='Specific permissions for this user.',
        related_query_name='customuser',
    )

class User(AbstractBaseUser):
    USER_TYPE_CHOICES = (("Internal", "Internal"), ("Customer", "Customer"))

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    contact_number = models.CharField(max_length=15, unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    email_otp = models.CharField(max_length=6, blank=True, null=True)
    contact_otp = models.CharField(max_length=6, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["contact_number"]

class Query(models.Model):
    PRIORITY_CHOICES = (("Low", "Low"), ("Medium", "Medium"), ("High", "High"))

    query_number = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    query_to = models.CharField(max_length=255)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES)
    description = models.TextField()
    attachment = models.FileField(upload_to="attachments/", null=True, blank=True)
    status = models.CharField(max_length=10, choices=[("Pending", "Pending"), ("Resolved", "Resolved")], default="Pending")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="queries")
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_queries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class QueryHistory(models.Model):
    query = models.ForeignKey(Query, on_delete=models.CASCADE, related_name="history")
    status = models.CharField(max_length=10, choices=[("Pending", "Pending"), ("Resolved", "Resolved")])
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now_add=True)  # auto_now for update timestamps
    created_at = models.DateTimeField(auto_now_add=True)  # auto_now_add for creation timestamp

    def __str__(self):
        return f"QueryHistory for Query {self.query.id}, Status: {self.status}"