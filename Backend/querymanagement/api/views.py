# views.py
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import authenticate, login 
from django.contrib import messages
from .models import Query, User
from .utils import generate_otp, send_email_otp, send_phone_otp

def signup(request):
    if request.method == 'POST':
        # Get user data from POST request
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type')

        # Create user but do not save yet
        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone_number=phone_number,
            user_type=user_type,
            password=password
        )
        
        # Generate and send OTPs
        otp_email = generate_otp()
        otp_phone = generate_otp()

        send_email_otp(email, otp_email)
        send_phone_otp(phone_number, otp_phone)

        # Save OTPs in the user object temporarily
        user.otp_email = otp_email
        user.otp_phone = otp_phone
        user.save()  # Save before OTP verification

        return redirect('verify_otp', user_id=user.id)

    return render(request, 'signup.html')


def verify_otp(request, user_id):
    user = get_object_or_404(User, id=user_id)

    if request.method == 'POST':
        email_otp = request.POST.get('email_otp')
        phone_otp = request.POST.get('phone_otp')

        # Check if both OTPs match
        if email_otp == user.otp_email and phone_otp == user.otp_phone:
            user.otp_verified_email = True
            user.otp_verified_phone = True
            user.save()

            # Redirect to login or dashboard
            login(request, user)
            return redirect('dashboard')

        else:
            messages.error(request, 'Invalid OTP. Please try again.')
    
    return render(request, 'verify_otp.html', {'user': user})


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')  # Redirect to appropriate page for the user type
        else:
            messages.error(request, 'Invalid credentials')
    return render(request, 'login.html')

# views.py (continued)
def query_list(request):
    queries = Query.objects.filter(status='pending')
    return render(request, 'query_list.html', {'queries': queries})


# views.py (continued)
def assign_query(request, query_id):
    query = get_object_or_404(Query, id=query_id)

    if request.method == 'POST':
        assigned_person = request.POST.get('assigned_person')
        resolution_date = request.POST.get('resolution_date')

        # Update query with assignment details
        query.assigned_person = assigned_person
        query.resolution_date = resolution_date
        query.status = 'resolved'
        query.save()

        return redirect('assigned_queries')

    return render(request, 'assign_query.html', {'query': query})
