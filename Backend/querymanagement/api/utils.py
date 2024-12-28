# utils.py
import random
from django.core.mail import send_mail
import requests
from django.conf import settings
import logging
import requests

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
def send_phone_otp(phone_number, otp):
    
    try:
        # You can either use the direct OTP sending method (as before):
        url = f"https://2factor.in/API/V1/{settings.SMS_API_KEY}/SMS/{phone_number}/{otp}/hi how areyou"
        headers = {"content-type": "application/json"}
        response = requests.get(url, headers=headers)
        
        if response.status_code == 500:
            logging.error(f"2Factor API Error: {response.text}")
            return False
            
        response.raise_for_status()
        return otp
        
        # Log successful response for debugging
        logging.info(f"2Factor API Response: {response.text}")
        return True
        
    except requests.exceptions.RequestException as e:
        logging.error(f"Phone OTP Error: {str(e)}")
        return False


    
