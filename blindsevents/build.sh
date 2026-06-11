#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Se déplacer dans le dossier contenant manage.py
cd blindsevents

python manage.py collectstatic --noinput
python manage.py migrate