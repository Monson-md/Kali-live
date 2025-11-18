# Utiliser une image Python légère
FROM python:3.11-slim

# Définir les variables d'environnement pour Python (meilleure performance)
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances (requirements.txt, etc.)
# Assurez-vous d'avoir un requirements.txt dans le dossier /backend
COPY requirements.txt /app/

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code de l'application
COPY . /app

# Le port sur lequel Uvicorn écoutera
EXPOSE 8000

# La commande est définie dans docker-compose.yml pour le mode développement avec --reload
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]