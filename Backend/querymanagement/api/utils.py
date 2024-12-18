# utils.py
import random
from django.core.mail import send_mail
import requests
from django.conf import settings



# Generate OTP
def generate_otp():
    return random.randint(100000, 999999)

def send_email_otp(email, otp):
    subject = "Your OTP Code"
    message = f"Your OTP code is {otp}. It is valid for 2 minutes."
    from_email = "akhileshspujar163@gmail.com"
    try:
        send_mail(subject, message, from_email, [email])
        return True
    except Exception as e:
        return str(e)
    
    
# Send OTP to phone using Firebase
def send_phone_otp(user_phone, otp):
    url = f"https://2factor.in/API/v1/{settings.SMS_API_KEY}/SMS/{user_phone}/{otp}/Your otpis"
    payload = ""
    headers = {"content-type":"application/x-www-form-urlencoded"}

    response = requests.get(url, data=payload, headers=headers)
    return bool(response.ok)


    
