from rest_framework.permissions import BasePermission

class IsInternalUser(BasePermission):
    """
    Allows access only to internal users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff
