# utils.py
import random
from django.core.mail import send_mail
from firebase_admin import messaging # type: ignore

# Generate OTP
def generate_otp():
    return random.randint(100000, 999999)

def send_email_otp(email, otp):
    subject = "Your OTP Code"
    message = f"Your OTP code is {otp}. It is valid for 5 minutes."
    from_email = "akhileshspujar163@gmail.com"
    try:
        send_mail(subject, message, from_email, [email])
        return True
    except Exception as e:
        return str(e)
    
    
# Send OTP to phone using Firebase
def send_phone_otp(user_phone, otp):
    try:
        message = messaging.Message(
        notification=messaging.Notification(
            title='OTP Verification',
            body=f'Your OTP code is {otp}.',
        ),
        token=user_phone,  # This should be the device token, need Firebase integration
     )
        response = messaging.send(message)

        return response

    except Exception as e:
        return str(e)
    
