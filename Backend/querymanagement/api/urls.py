from django.urls import path
from . import views

urlpatterns = [
    # Authentication URLs
    path('signup/', views.signup, name='signup'),  # Sign-up page
    path('verify-otp/<int:user_id>/', views.verify_otp, name='verify_otp'),  # OTP verification page
    path('login/', views.login_view, name='login'),  # Login page

    # Customer User URLs
    path('customer/create-query/', views.create_query, name='create_query'),  # Create query page
    path('customer/query-list/', views.query_list, name='query_list'),  # View list of queries

    # Internal User URLs
    path('internal/assign-query/<int:query_id>/', views.assign_query, name='assign_query'),  # Assign query page
    path('internal/assigned-queries/', views.query_list, name='assigned_queries'),  # View assigned queries (reuse query_list for simplicity)
]
