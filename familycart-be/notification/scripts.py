from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template import Context
from django.template.loader import get_template
from django.conf import settings

# ------------------------------------------------------------------------------
# Parameters:
#   mail_content       : dict containing template variables
#   txt_template_path  : path to the plain text template
#   html_template_path : path to the HTML template
#   subject            : subject of the email
#   from_email         : sender's email address
#   to_emails          : recipient's email address or list of emails
# ------------------------------------------------------------------------------
def send_mail_with_template(mail_content, txt_template_path, html_template_path, subject, from_email, to_emails):
    """ Sends an email using both a plain text template and an HTML template. """
    mail_content = mail_content
    try:
        with open(settings.ROOT_DIR + txt_template_path) as f:
            full_msg = f.read()
        message = EmailMultiAlternatives(subject=subject, body=full_msg, from_email=from_email, to=[to_emails])
        html_template = get_template(settings.ROOT_DIR +html_template_path).render(mail_content)
        message.attach_alternative(html_template, 'text/html')
        message.send()
    except Exception as e:
        print("Exception in send_mail_with_template -->", e)


# ------------------------------------------------------------------------------
# Parameters:
#   subject          : subject of the email
#   first_name       : first name of the user
#   verification_otp : OTP to verify the user
#   to_emails        : recipient's email address
#   from_email       : sender's email address
# ------------------------------------------------------------------------------
def send_user_sign_up_mail(subject,first_name, verification_otp, to_emails, from_email=settings.EMAIL_HOST_USER):
    """ Sends a user verification email after sign-up. """
    mail_content = {'first_name': first_name, "verification_otp":verification_otp}
    txt_template_path = "templates/verify_email.txt"
    html_template_path = "templates/verify_otp.html"
    send_mail_with_template(mail_content, txt_template_path, html_template_path, subject, from_email, to_emails)