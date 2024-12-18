
import uuid
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics,permissions

from rest_framework.permissions import IsAuthenticated
from .utils import generate_otp, send_email_otp, send_phone_otp
from django.utils.timezone import now, timedelta
from django.core.cache import cache
from .serializers import UserSerializer
from django.contrib.auth import authenticate, login
from .models import Query,User
import logging
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
current_time = timezone.now()


from .serializers import QuerySerializer,QueryAssignSerializer
from .permissions import IsInternalUser
from rest_framework_simplejwt.tokens import RefreshToken


from .models import Department



logger = logging.getLogger(__name__)


class SignupInitView(APIView):
    def post(self, request):
        # Validate input data
        serializer = UserSerializer(data=request.data)
        
        # Comprehensive input validation
        validation_errors = []

        # Email validation
        email = request.data.get('email')
        try:
            validate_email(email)
        except ValidationError:
            validation_errors.append("Invalid email format")

        # Check if serializer is valid
        if not serializer.is_valid():
            validation_errors.extend(
                [f"{field}: {errors}" for field, errors in serializer.errors.items()]
            )

        # Return validation errors if any
        if validation_errors:
            return Response({
                "error": "Validation failed",
                "details": validation_errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Generate OTPs
            email_otp = generate_otp()
            email_result = send_email_otp(email, email_otp)
            # phone_otp = generate_otp()
            expires_at = now() + timedelta(minutes=2)

            # Generate a unique session ID
            session_id = str(uuid.uuid4())
            
            # Save OTP in the database
            # OTP.objects.create(
            #     email=email, 
            #     # phone_otp=phone_otp, 
            #     email_otp=email_otp, 
            #     expires_at=expires_at
            # )
            
            # Prepare user data for caching (excluding sensitive information)
            user_data = {k: v for k, v in serializer.validated_data.items() if k != 'password'}
            
            # Store user details in cache with session ID
            cache.set(f'signup_session_{session_id}', {
                'user_data': user_data,
                'otp': email_otp
            }, timeout=600)  # 10 minutes expiry
            
            # Send OTP via email
            
            
            # Check email sending result
            if not email_result:
                # Log the email sending failure
                logger.error(f"Failed to send OTP to {email}")
                return Response({
                    'error': 'Failed to send OTP',
                    'details': email_result or 'Unknown email sending error'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Successful OTP generation and sending
            return Response({
                'session_id': session_id,
                'message': 'OTP sent successfully'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Log unexpected errors
            logger.error(f"Signup Initialization Error: {str(e)}")
            
            return Response({
                'error': 'An unexpected error occurred during signup initialization',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

User = get_user_model()

class VerifyEmailOTPView(APIView):
    @transaction.atomic
    def post(self, request):
        # Extract query_to and token from request
        session_id = request.data.get('session_id')
        token = request.data.get('otp')

        # Validate input
        if not session_id or not token:
            return Response({
                'error': 'Missing query_to or OTP',
                'details': 'Both query_to and OTP are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve session data from cache
        cache_key = f'signup_session_{session_id}'
        session_data = cache.get(cache_key)

        # Check if session exists
        if not session_data:
            return Response({
                'error': 'Invalid or expired session',
                'details': 'Session has expired or is invalid'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Extract stored OTP and user data
        stored_otp = session_data.get('otp')
        user_data = session_data.get('user_data', {})

        # Verify OTP
        if str(token) != str(stored_otp):
            return Response({
                'error': 'Invalid OTP',
                'details': 'The provided OTP does not match'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Extract password if present (and remove from user_data)
            password = user_data.pop('password', None)

            # Create user
            # Assuming your User model has these fields
            user = User.objects.create_user(
                email=user_data.get('email'),
                user_type=user_data.get('user_type'),
                password= user_data.get('password',user_data.get('password')),
                contact_number= user_data.get('cotact_number',user_data.get('contact_number')),
                first_name= user_data.get('first_name',user_data.get('first_name')),
                last_name= user_data.get('last_name',user_data.get('last_name')),
                
                  # This will add any additional fields
            )

            # Clear the cache after successful verification
            cache.delete(cache_key)

            return Response({
                'message': 'User created successfully',
                'user_id': user.id,
                'email': user.email
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"User creation error: {str(e)}")
            return Response({
                'error': 'An unexpected error occurred during user creation',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class LoginView(APIView):
    def post(self, request):
        try:
            # Extract email and password from request
            email = request.data.get('email')
            password = request.data.get('password')

            if not email or not password:
                return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

            # Authenticate the user
            user = User.objects.filter(email=email).first()

            if user is None:
                return Response({"error": "invalid creds"}, status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_active:
                return Response({"error": "User account is disabled"}, status=status.HTTP_403_FORBIDDEN)

            # Generate JWT tokens for the authenticated user
            refresh = RefreshToken.for_user(user)

            # Determine user type
            
            if user and user.check_password(password):
              refresh = RefreshToken.for_user(user)
              #user_type = "customer" if hasattr(user, 'is_customer') and user.is_customer else "internal"
              return Response({
                "message": "Login successful",
                "userType": user.user_type,
                "email": user.email,
                "accessToken": str(refresh.access_token),
                "refreshToken": str(refresh),
            }, status=status.HTTP_200_OK)          
            
        
        

        except Exception as e:
            return Response({"error": "An unexpected error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
# 1. Create a query
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Query, Department
from .serializers import QuerySerializer
import logging

logger = logging.getLogger(__name__)

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Query, Department
from .serializers import QuerySerializer
import logging

logger = logging.getLogger(__name__)

from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, Department, Query
from .serializers import QuerySerializer
import logging

logger = logging.getLogger(__name__)

class RaiseQueryView(APIView):
    def post(self, request):
        # Extract email from the request
        email = request.data.get('email')
        
        if not email:
            return Response({
                'error': 'Missing email',
                'details': 'Email is required to create a query'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found',
                'details': 'No user found with the provided email'
            }, status=status.HTTP_404_NOT_FOUND)

        # Extract required query fields
        query_data = {
            "queryNumber": request.data.get("queryNumber"),
            "priority": request.data.get("priority"),
            "title": request.data.get("title"),
            "subject": request.data.get("subject"),
            "queryTo": request.data.get("queryTo"),
            "description": request.data.get("description"),
            "attachment": request.data.get("attachment"),
        }

        # Check for missing fields
        missing_fields = [key for key, value in query_data.items() if not value]
        if missing_fields:
            return Response({
                "error": "Missing query data",
                "details": f"The following fields are required: {', '.join(missing_fields)}"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the Department instance based on the queryTo value (assuming queryTo is the department name)
        try:
            department = Department.objects.get(name=query_data["queryTo"])
        except Department.DoesNotExist:
            return Response({
                "error": "Invalid department",
                "details": f"Department '{query_data['queryTo']}' does not exist"
            }, status=status.HTTP_400_BAD_REQUEST)

        # Prepare the data for the serializer
        query_data["created_by"] = user.id
        query_data["query_to"] = department

        # Ensure timezone-aware datetime for created_at
        query_data["created_at"] = current_time  # Correct method to get current time

        # Use the QuerySerializer to validate and save the query
        serializer = QuerySerializer(data=query_data)

        if serializer.is_valid():
            try:
                query = serializer.save()  # This will save the Query instance and return it
                return Response({
                    "message": "Query created successfully",
                    "query_number": query.query_number,  # Use query_number instead of id
                    "title": query.title,
                    "queryNumber": query.query_number,
                    "priority": query.priority
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Query creation error: {str(e)}")
                return Response({
                    'error': 'An unexpected error occurred during query creation',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': 'Invalid query data',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# 2. Get query list
class QueryListView(APIView):
      def post(self, request):
        # Extract email from request body
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Missing email',
                'details': 'Email is required in the request body'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user by email
        try:
            user = User.objects.get(email=email)
            if user.is_staff:
                queries = Query.objects.all()
            else:
            # Non-staff users can only see their own queries
                queries = Query.objects.filter(created_by__email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found',
                'details': 'No user associated with the provided email'
            }, status=status.HTTP_404_NOT_FOUND)

        # Fetch queries created by this user (use created_by__email to match by email)
        queries = Query.objects.filter(created_by__email=email)

        # Prepare response data
        response_data = [
            {
                'queryNumber': query.query_number,
                'title': query.title,
                'subject': query.subject,
                'queryTo': str(query.query_to),
                'priority': query.priority,
            }
            for query in queries
        ]
        return Response(response_data, status=status.HTTP_200_OK)
      
          

class InternalQueryView(APIView):
    def post(self, request):
        # Extract email from request body
        email = request.data.get('email')
        if not email:
            return Response({
                'error': 'Missing email',
                'details': 'Email is required in the request body'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Fetch the user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'User not found',
                'details': 'No user associated with the provided email'
            }, status=status.HTTP_404_NOT_FOUND)

        # Check if the user is internal
        if not getattr(user, 'user_type', False):
            return Response({
                'error': 'Permission denied',
                'details': 'Only internal users can access this data'
            }, status=status.HTTP_403_FORBIDDEN)

        # Retrieve all queries for internal users
        queries = Query.objects.all()

        # Prepare response data
        response_data = [
            {
                'queryNumber': query.query_number,
                'title': query.title,
                'subject': query.subject,
                'queryTo': str(query.query_to),
                'priority': query.priority,
                'status': query.status,
                'assignTo': str(query.assigned_to)
            }
            for query in queries
        ]

        return Response(response_data, status=status.HTTP_200_OK)
          
      


# def patch(self, request, query_id):
#         # Extract email from request body
#         email = request.data.get('email')
#         if not email:
#             return Response({
#                 'error': 'Missing email',
#                 'details': 'Email is required in the request body'
#             }, status=status.HTTP_400_BAD_REQUEST)

#         # Fetch the user by email
#         try:
#             user = User.objects.get(email=email)

#             # Check if the user is internal
#             if not user.is_staff:
#                 return Response({
#                     'error': 'Permission denied',
#                     'details': 'Only internal users can edit query statuses'
#                 }, status=status.HTTP_403_FORBIDDEN)

#         except User.DoesNotExist:
#             return Response({
#                 'error': 'User not found',
#                 'details': 'No user associated with the provided email'
#             }, status=status.HTTP_404_NOT_FOUND)

#         # Retrieve query to update
#         try:
#             query = Query.objects.get(id=query_id)
#         except Query.DoesNotExist:
#             return Response({
#                 'error': 'Query not found',
#                 'details': 'No query found with the provided ID'
#             }, status=status.HTTP_404_NOT_FOUND)

#         # Update query status
#         try:
#             new_status = request.data.get('status')
#             if not new_status:
#                 return Response({
#                     'error': 'Missing status',
#                     'details': 'Status is required to update the query'
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             query.status = new_status
#             query.save()

#             return Response({
#                 'message': 'Query status updated successfully',
#                 'query_id': query.id,
#                 'new_status': query.status
#             }, status=status.HTTP_200_OK)

#         except Exception as e:
#             logger.error(f"Error updating query status: {str(e)}")
#             return Response({
#                 'error': 'An error occurred while updating query status',
#                 'details': str(e)
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class UpdateQueryView(generics.UpdateAPIView):
    """
    View to update query details (accessible only by internal users).
    """
    serializer_class = QuerySerializer
    permission_classes = [IsAuthenticated, IsInternalUser]  # Ensure user is authenticated and internal
    queryset = Query.objects.all()

    def update(self, request, *args, **kwargs):
        # Step 1: Check if the 'Authorization' token is present in the headers
        # auth_header = request.headers.get('Authorization')
        
        # if not auth_header:
        #     return Response({"error": "Authorization token is missing"}, status=status.HTTP_401_UNAUTHORIZED)

        # Step 2: Extract the 'query_number' from request headers
        query_number = request.headers.get('query_number')
        
        if not query_number:
            return Response({"error": "Query number is missing from the request header"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Step 3: Fetch the Query object using the 'query_number'
            instance = Query.objects.filter(query_number=query_number).first()

            if not instance:
                return Response({"error": "Query with the specified query_number does not exist"}, status=status.HTTP_404_NOT_FOUND)

            # Step 4: Check for necessary fields in the request body
            required_fields = ['assigned_to', 'status', 'query_to']
            for field in required_fields:
                if field not in request.data:
                    return Response(
                        {"error": f"'{field}' is required in the request body"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Step 5: Determine if the update should be partial (i.e., only update fields that are present in the request)
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)

            # Step 6: Perform the update
            self.perform_update(serializer)

            return Response(
                {"message": "Query updated successfully", "data": serializer.data},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
class AssignQueryView(generics.UpdateAPIView):
    """
    View to assign a query to a specific department (accessible only by internal users).
    """
    serializer_class = QueryAssignSerializer
    permission_classes = [IsInternalUser]
    queryset = Query.objects.all()

    def update(self, request, *args, **kwargs):
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({"message": "Query assigned successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        try:
            serializer.save(assigned_at=timezone.now())
        except Exception as e:
            raise Exception(f"Failed to assign query: {str(e)}")


class QueryByDepartmentView(APIView):
    """
    View to filter queries by department (accessible only by internal users).
    """
    permission_classes = [IsInternalUser]

    def get(self, request, department):
        try:
            queries = Query.objects.filter(assigned_to_department=department)
            if not queries.exists():
                return Response({"message": "No queries found for this department"}, status=status.HTTP_404_NOT_FOUND)

            serializer = QuerySerializer(queries, many=True)
            return Response({"data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "You have access to this protected resource."})
    

class QueryToChoicesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            departments = Department.objects.all()
            choices = [
                {'id': dept.id, 'name': dept.name} 
                for dept in departments
            ]
            return Response(choices, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)