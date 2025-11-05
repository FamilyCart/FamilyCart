from user.models import *
import secrets
import environ

env = environ.Env()

def generate_otp():
    """Generate a 4-digit OTP."""
    return str(random.randint(1000, 9999))