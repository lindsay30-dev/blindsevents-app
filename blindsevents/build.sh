#!/usr/bin/env bash
# build.sh – exécuté par Render pendant le build

# Sortir en cas d'erreur
set -o errexit

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt

# Appliquer les migrations
python manage.py migrate

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Créer un superutilisateur s'il n'existe pas
# Les variables d’environnement DJANGO_SUPERUSER_USERNAME, DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD doivent être définies dans Render
python manage.py createsuperuser --noinput \
  --username $DJANGO_SUPERUSER_USERNAME \
  --email $DJANGO_SUPERUSER_EMAIL 2>/dev/null || true

# Optionnel : afficher un message
echo "Build terminé avec succès"