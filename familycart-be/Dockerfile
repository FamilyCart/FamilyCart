# ================================
#  Django + PostgreSQL + Gunicorn
# ================================

# Use Python 3.13.9 slim image
FROM python:3.13.9-slim

# Prevent Python from buffering logs
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential libpq-dev gcc \
    && apt-get clean

# Install Python dependencies first (layer caching)
COPY requirements/v1/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy Django project code
COPY . /app

# Expose Django port
EXPOSE 8000

# Start Django using Gunicorn
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn familycart.wsgi:application --bind 0.0.0.0:8000"]

