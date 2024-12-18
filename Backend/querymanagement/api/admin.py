from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from .models import (
    User,
    Query,
    QueryHistory,
    Department
 
)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('email', 'first_name', 'last_name', 'contact_number', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_active', 'user_type')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'contact_number', 'user_type')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'contact_number', 'password1', 'password2', 'first_name', 'last_name', 'user_type', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('email', 'first_name', 'last_name', 'contact_number')
    ordering = ('email',)
    
@admin.register(Query)
class AssetNameAdmin(admin.ModelAdmin):
    list_display = (
        "query_number",
        "user",
        "title",
        "subject",
        "query_to",
        "priority",
        "description",
        "attachment",
        "status",
        "created_by",
        "assigned_to",
        "created_at",
        "updated_at",
    )
    search_fields = ("QueryNumber",)
    list_filter = ("user",)

@admin.register(QueryHistory)
class AssetNameAdmin(admin.ModelAdmin):
    list_display = (
        "query",
        "status",
        "updated_by",
        "comment",
        "updated_at",
        "created_at",
        
    )
    search_fields = ("Query",)
    list_filter = ("query",)

@admin.register(Department)
class AssetNameAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'status', 'created_at')  
    search_fields = ("Department",)
    list_filter = ("status",)

# Register the custom user model and admin
admin.site.register(User, CustomUserAdmin)
