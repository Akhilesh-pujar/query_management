from django.urls import path

from api.views import SignupInitView,VerifyEmailOTPView, VerifyEmailOTPView, QueryListView,AssignQueryView,LoginView,RaiseQueryView,UpdateQueryView,QueryByDepartmentView,ProtectedView,QueryToChoicesView,InternalQueryView
from rest_framework_simplejwt.views import(TokenObtainPairView, TokenRefreshView)
urlpatterns = [
    # Authentication URLs
   path('userdata-cache-withotp/', SignupInitView.as_view(), name='signup'),  # Sign-up page
   path("userdata-verify-save/", VerifyEmailOTPView.as_view(), name="send_email_otp"),
    
   path('login/', LoginView.as_view(), name='login'),  # Login page

    path('queries/create/', RaiseQueryView.as_view(), name='create-query'),
    path('queries/list/', QueryListView.as_view(), name='query-list'),
    path('queries/internalqueries/', InternalQueryView.as_view(), name='query-list'),
    path('queries/update/', UpdateQueryView.as_view(), name='update-query'),
    path('queries/assign/<int:pk>/', AssignQueryView.as_view(), name='assign-query'),
    path('queries/department/<str:department>/', QueryByDepartmentView.as_view(), name='query-by-department'),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/protected/', ProtectedView.as_view(), name='protected'),
    path('queries/to-choices/', QueryToChoicesView.as_view(), name='query-to-choices'),
  
]
