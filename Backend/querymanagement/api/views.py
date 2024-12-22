
import uuid
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics,permissions
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated
from .utils import generate_otp, send_email_otp, send_phone_otp
from django.utils.timezone import now, timedelta
from django.core.cache import cache
from .serializers import UserSerializer
from django.contrib.auth import authenticate, login
from .models import Query, QueryHistory,User
import logging
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.db import transaction



from .serializers import QuerySerializer,QueryAssignSerializer
from .permissions import IsInternalUser
from rest_framework_simplejwt.tokens import RefreshToken


from .models import Department, Comment



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
            user_data = serializer.validated_data.copy()
            
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
            password = user_data.get('password')

            if not password:
                return Response({
                    'error': 'Password is missing',
                    'details': 'Password must be provided during signup'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create user
            # Assuming your User model has these fields
            user = User.objects.create_user(
                email=user_data.get('email'),
                user_type=user_data.get('user_type'),
                contact_number= user_data.get('cotact_number',user_data.get('contact_number')),
                first_name= user_data.get('first_name',user_data.get('first_name')),
                last_name= user_data.get('last_name',user_data.get('last_name')),
                password= user_data.get('password',user_data.get('password')),
                
                  # This will add any additional fields
            )
            user.set_password(password)  # Hash the password
            user.save()

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
            
            if not check_password(password, user.password):
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_active:
                return Response({"error": "User account is disabled"}, status=status.HTTP_403_FORBIDDEN)

            # Generate JWT tokens for the authenticated user
            refresh = RefreshToken.for_user(user)

            # Determine user type
            
          
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

logger = logging.getLogger(__name__)

class RaiseQueryView(APIView):
    def post(self, request):
        try:
            # Extract email from the request data
            email = request.data.get('email')
            if not email:
                return Response({
                    'error': 'Missing email',
                    'details': 'Email is required to create a query'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Check if the email corresponds to a valid user
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({
                    'error': 'User not found',
                    'details': 'No user found with the provided email'
                }, status=status.HTTP_404_NOT_FOUND)

            # Extract query number and validate its presence
            query_number = request.data.get('queryNumber')
            if not query_number:
                return Response({
                    'error': 'Missing query number',
                    'details': 'Query number is required'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Get department
            department_name = request.data.get('queryTo')
            try:
                department = Department.objects.get(name=department_name)
            except Department.DoesNotExist:
                return Response({
                    'error': 'Invalid department',
                    'details': f"Department '{department_name}' does not exist"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Prepare query data
            query_data = {
                'query_number': query_number,
                'title': request.data.get('title'),
                'subject': request.data.get('subject'),
                'query_to': department.id,  # Use department ID instead of name
                'priority': request.data.get('priority', 'Low'),
                'description': request.data.get('description'),
                'status': request.data.get('status', 'Pending'),
                'created_by': user.id
            }

            # Handle attachment if present
            if 'attachment' in request.FILES:
                query_data['attachment'] = request.FILES['attachment']

            # Create and validate the query
            serializer = QuerySerializer(data=query_data)
            if not serializer.is_valid():
                return Response({
                    'error': 'Invalid query data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

            # Save the query
            query = serializer.save()

            return Response({
                'message': 'Query created successfully',
                'query_number': query.query_number,
                'title': query.title,
                'priority': query.priority,
                'status': query.status,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': 'An unexpected error occurred during query creation',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
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
                'status' : query.status,
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
          
      

class UpdateQueryView(generics.UpdateAPIView):
    """
    View to update query details (accessible only by internal users).
    """
    serializer_class = QuerySerializer
    queryset = Query.objects.all()

    def update(self, request, *args, **kwargs):
        query_number = request.data.get('queryNumber')
        assigned_to_email = request.data.get("assignedTo")
        querystatus = request.data.get("status")
        query_data = request.data.get("queryTo")

        if not query_number:
            return Response(
                {"error": "Query number is missing from the request header"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not assigned_to_email:
            return Response(
                {"error": "Assigned user email is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure the assigned user is a staff member
        staff_user = User.objects.filter(email=assigned_to_email, user_type="Internal").first()
        if not staff_user:
            return Response(
                {"error": "Assigned user must be a staff member."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Attempt to fetch the query instance
        instance = Query.objects.filter(query_number=query_number).first()
        if not instance:
            return Response(
                {"error": "Query with the specified query number does not exist"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if query_data is a string
        if isinstance(query_data, str):
            try:
                department = Department.objects.get(name=query_data)
            except Department.DoesNotExist:
                return Response({
                    "error": "Invalid department",
                    "details": f"Department '{query_data}' does not exist"
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                "error": "Invalid 'queryTo' format. Expected a string."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Update the query instance with the validated data
        try:
          
            instance.assigned_to = staff_user
            instance.status = querystatus
            instance.query_to = department
            instance.save()

            serializer = QuerySerializer(instance)
            

            return Response(
                {"message": "Query updated successfully", "data": serializer.data},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


class AddQueryHistory(APIView):
    def post(self, request):
        try:
            query_number = request.data.get("query_number")        
            status = request.data.get("status")
            updated_by = request.data.get("updated_by")
            comment = request.data.get("comment")

            if not query_number or not comment or not status:
                return Response(
                    {"error": "Both 'query_number' and 'comment' are required."},
                    status=400,
                )

            try:
                query_instance = Query.objects.get(query_number=query_number)
                user_object = User.objects.get(email=updated_by)
            except Query.DoesNotExist:
                return Response(
                    {"error": f"Query with number {query_number} does not exist."},
                    status=404,
                )

            QueryHistory.objects.create(query=query_instance, comment=comment , status=status , updated_by=user_object)

            return Response({"message": "Query history added successfully."}, status=201)

        except Exception as e:
            return Response({"error": "Invalid JSON payload."}, status=400)
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"}, status=500
            )
    


class AddComment(APIView):
    def post(self, request):
        try:
            user = request.data.get("user")    
            query = request.data.get('query')    
            comment = request.data.get("comment")
            description = request.data.get("description")
           
            if  not all([user, comment, description, query]):
                return Response(
                    {"error": "Both 'query_number' and 'comment' are required."},
                    status=400,
                )

            try:
                user_object = User.objects.get(email=user)
                query_instance = Query.objects.get(query_number=query)
            except Query.DoesNotExist:
                return Response(
                    {"error": f"User {user} does not exist."},
                    status=404,
                )

            Comment.objects.create(user=user_object, query=query_instance, comment=comment , description=description)

            return Response({"message": "Comment added successfully."}, status=201)

        except Exception as e:
            return Response({"error": "Invalid JSON payload."}, status=400)
        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"}, status=500
            )
    







