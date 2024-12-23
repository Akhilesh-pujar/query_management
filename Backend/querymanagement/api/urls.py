from django.urls import path

from api.views import (SignupInitView,VerifyEmailOTPView, VerifyEmailOTPView, 
                       QueryListView,LoginView,RaiseQueryView,
                       UpdateQueryView,InternalQueryView,AddQueryHistory ,
                       AddComment)




urlpatterns = [
    # Authentication URLs
   path('userdata-cache-withotp/', SignupInitView.as_view(), name='signup'),  # Sign-up page
   path("userdata-verify-save/", VerifyEmailOTPView.as_view(), name="send_email_otp"),
    
   path('login/', LoginView.as_view(), name='login'),  # Login page

    path('queries/create/', RaiseQueryView.as_view(), name='create-query'),
    path('queries/list/', QueryListView.as_view(), name='query-list'),
    path('queries/internalqueries/', InternalQueryView.as_view(), name='query-list'),
    path('queries/update/', UpdateQueryView.as_view(), name='update-query'),

    path('queryhistory/', AddQueryHistory.as_view(), name='add-history'),
    path('comment/', AddComment.as_view(), name='comment'),
    
   
  
]
