# utils.py
import random
from django.core.mail import send_mail
from firebase_admin import messaging # type: ignore

# Generate OTP
def generate_otp():
    return str(random.randint(100000, 999999))

# Send OTP to email
def send_email_otp(user_email, otp):
    send_mail(
        'Your OTP Code',
        f'Your OTP code is {otp}.',
        'your_email@example.com',
        [user_email],
        fail_silently=False,
    )

# Send OTP to phone using Firebase
def send_phone_otp(user_phone, otp):
    message = messaging.Message(
        notification=messaging.Notification(
            title='OTP Verification',
            body=f'Your OTP code is {otp}.',
        ),
        token=user_phone,  # This should be the device token, need Firebase integration
    )
    response = messaging.send(message)
    return response
