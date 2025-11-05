from constants.response import KEY_MESSAGE, KEY_PAYLOAD, KEY_STATUS
from rest_framework import status
from rest_framework.response import Response
from functools import wraps

# ------------------------------------------------------------------------------
# Decorator: handle_exceptions
# ------------------------------------------------------------------------------
# This decorator is used to wrap Django REST Framework view methods.
# It ensures that any unhandled exception raised within the view
# is caught and returned as a standardized JSON response, instead of
# breaking the API with an unformatted traceback.
#
# Features:
# - Catches all exceptions
# - Logs or returns a clean structured error response
# - Helps maintain consistent API responses across endpoints
# ------------------------------------------------------------------------------

def handle_exceptions(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            # Execute the wrapped view function
            return func(*args, **kwargs)
        except Exception as e:
            # Catch and handle any exception, returning a structured error
        	return Response(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                data={
					KEY_MESSAGE: "Exception Occured",
					KEY_PAYLOAD: f"An error occurred: {str(e)}",
					KEY_STATUS: -1
                },
            )
    return wrapper