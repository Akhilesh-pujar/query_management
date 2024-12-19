from datetime import datetime
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator

class UserManager(BaseUserManager):
    def create_user(self, email, contact_number, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field is required.")
        if not contact_number:
            raise ValueError("The Contact Number field is required.")

        # Normalize email
        email = self.normalize_email(email)
       
        # Avoid email duplication in extra_fields
        extra_fields.pop('email', None)

        user = self.model(email=email, contact_number=contact_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, contact_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if not extra_fields.get('is_staff'):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get('is_superuser'):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, contact_number, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USER_TYPE_CHOICES = (
        ("Internal", "Internal"),
        ("Customer", "Customer"),
    )

    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$', 
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    contact_number = models.CharField(
        validators=[phone_regex], 
        max_length=17, 
        unique=True
    )
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    email_otp = models.CharField(max_length=6, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Custom manager
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['contact_number', 'first_name', 'last_name', 'user_type']

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.first_name

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

class Department(models.Model):
    """
    Model to manage different departments dynamically
    """
    DEPARTMENT_STATUS_CHOICES = (
        ('ITSUPPORT', 'ITSUPPORT'),
        ('IT_TEAM', 'IT_TEAM'),
        ('HARDWARE SUPPORT','HARDWARE SUPPORT')
    )

    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20, 
        choices=DEPARTMENT_STATUS_CHOICES, 
        default='ITSUPPORT'
    )
    query_to_id = models.ForeignKey(
        'Query', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="linked_departments"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        verbose_name_plural = "Departments"
        ordering = ['name']

class Query(models.Model):
    PRIORITY_CHOICES = (
        ("Low", "Low"),
        ("Medium", "Medium"),
        ("High", "High")
    )
    
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Resolved", "Resolved"),
        ("In Progress", "In Progress"),
        ("Closed", "Closed")
    ]
    
    query_number = models.CharField(
        max_length=50,
        primary_key=True,
        unique=True,
        blank=False,  # Ensure it's not blank
        null=False   # Ensure it's not null
    )
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    query_to = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        related_name="queries"
    )
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="Low")
    description = models.TextField()
    attachment = models.FileField(upload_to="attachments/", null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_queries"
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_queries"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.query_number}"

    class Meta:
        ordering = ['-created_at']

class QueryHistory(models.Model):
    query = models.ForeignKey(Query, on_delete=models.CASCADE, related_name="history")
    status = models.CharField(
        max_length=20, 
        choices=Query.STATUS_CHOICES
    )
    updated_by = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"QueryHistory for Query {self.query.query_number}, Status: {self.status}"