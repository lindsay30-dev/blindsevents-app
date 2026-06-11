#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create media directory if it doesn't exist
mkdir -p media

# Collect static files
python manage.py collectstatic --noinput

# Apply database migrations
python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py createsuperuser --noinput --username "$DJANGO_SUPERUSER_USERNAME" --email "$DJANGO_SUPERUSER_EMAIL" 2>/dev/null || echo "Superuser already exists or credentials not set"

echo "Build completed successfully!"