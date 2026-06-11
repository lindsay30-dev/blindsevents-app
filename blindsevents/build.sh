#!/usr/bin/env bash
set -o errexit

echo "==> Installation des dépendances"
pip install --upgrade pip
pip install -r requirements.txt

echo "==> Collecte des fichiers statiques"
python manage.py collectstatic --noinput

echo "==> Application des migrations"
python manage.py migrate

echo "==> Création du superutilisateur (si non existant)"
python manage.py createsuperuser --noinput \
  --username "$DJANGO_SUPERUSER_USERNAME" \
  --email "$DJANGO_SUPERUSER_EMAIL" \
  2>/dev/null || echo "Superutilisateur déjà existant"

echo "==> Build terminé avec succès"