from django.urls import path
from . import views
from api.views import SignupView,SendEmailOTPView, VerifyEmailOTPView, QueryListView,AssignQueryView,LoginView

urlpatterns = [
    # Authentication URLs
    path('signup/', SignupView.as_view(), name='signup'),  # Sign-up page
   path("send-email-otp/", SendEmailOTPView.as_view(), name="send_email_otp"),
    path("verify-email-otp/", VerifyEmailOTPView.as_view(), name="verify_email_otp"),

   
  # OTP verification page
    path('login/', LoginView.as_view(), name='login'),  # Login page
    
    # Customer User URLs
    
    path('customer/query-list/', QueryListView.as_view(), name='query_list'),  # View list of queries

    # Internal User URLs
    path('internal/assign-query/<int:query_id>/', AssignQueryView.as_view(), name='assign_query'),  # Assign query page
    #path('internal/assigned-queries/', views.query_list, name='assigned_queries'),  # View assigned queries (reuse query_list for simplicity)
]
