from user.models import *
import secrets
import environ

env = environ.Env()


def generate_verification_token():
	""" generate the tokens for user signuo verification """
	return secrets.token_hex(60)

def generate_user_account_verification_link(token, target):
	return f"{env('FRONTEND_URL')}{target}{token}"

def generate_otp():
    """Generate a 4-digit OTP."""
    return str(random.randint(1000, 9999))