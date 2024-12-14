from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import OTP
from .utils import generate_otp, send_email_otp, send_phone_otp
from django.utils.timezone import now, timedelta
import json
from .serializers import UserSerializer
from django.contrib.auth import authenticate, login
from .models import Query
class SendEmailOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        contact_number = request.data.get("contactNumber")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        email_otp = generate_otp()
        phone_otp = generate_otp()
        expires_at = now() + timedelta(minutes=2)

        # Save OTP in the database
        OTP.objects.create(email=email, phone_otp=phone_otp, email_otp=email_otp, expires_at=expires_at)

        # Send OTP via email and phone
        email_result = send_email_otp(email, email_otp)
        phone_result = send_phone_otp(contact_number, phone_otp)

        if email_result and phone_result:
            return Response({"message": "OTP sent successfully"})
        else:
            errors = []
            if email_result != "":
                errors.append(f"Failed to send OTP: {email_result}")
            if phone_result != "":
                errors.append(f"Failed to send OTP: {phone_result}")

            return Response({"error": " ".join(errors)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyEmailOTPView(APIView):
    def post(self, request):
        data = request.data
        email = data.get("email")
        otp = data.get("otp")

        if not email or not otp:
            return Response({"error": "Email and OTP are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_record = OTP.objects.get(email=email, email_otp=otp )
            if not otp_record.is_valid():
                return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

            # Delete OTP after successful verification
            otp_record.delete()
            return Response({"message": "OTP verified successfully"})
        except OTP.DoesNotExist:
            return Response({"error": "Invalid OTP or email"}, status=status.HTTP_400_BAD_REQUEST)

class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({"message": "Login successful"})
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
class QueryListView(APIView):
    def get(self, request):
        queries = Query.objects.filter(status='pending')
        data = [{"id": query.id, "question": query.question, "status": query.status} for query in queries]
        return Response({"queries": data}, status=status.HTTP_200_OK)
    
class AssignQueryView(APIView):
    def post(self, request, query_id):
        query = Query.objects.filter(id=query_id).first()

        if not query:
            return Response({"error": "Query not found"}, status=status.HTTP_404_NOT_FOUND)

        assigned_person = request.data.get('assigned_person')
        resolution_date = request.data.get('resolution_date')

        if not assigned_person or not resolution_date:
            return Response({"error": "Assigned person and resolution date are required"}, status=status.HTTP_400_BAD_REQUEST)

        query.assigned_person = assigned_person
        query.resolution_date = resolution_date
        query.status = 'resolved'
        query.save()

        return Response({"message": "Query assigned successfully"})