from pydantic_settings import BaseSettings
from typing import Optional

# ATTENTION : La ligne qui causait le problème (Importation Circulaire) était
# probablement ici, essayant d'importer 'settings' depuis ce même module. 
# Le fichier de configuration ne doit faire aucune importation interne au projet.

class Settings(BaseSettings):
    """
    Configuration de base chargée à partir des variables d'environnement.
    """
    # Configuration du projet
    PROJECT_NAME: str = "Kali-lite Backend API"
    API_V1_STR: str = "/api/v1"
    
    # Configuration de l'environnement
    ENVIRONMENT: str = "development"
    
    # Clé secrète FastAPI (À modifier pour la production)
    SECRET_KEY: str = "super_secure_and_long_secret_key"
    
    # Configuration de la base de données (exemple)
    # Laissez ces valeurs si vous utilisez un service Docker nommé 'db'
    POSTGRES_USER: str = "kali_user"
    POSTGRES_PASSWORD: str = "kali_password"
    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "kali_db"
    
    # Définition de la source des variables d'environnement
    class Config:
        case_sensitive = True
        env_file = ".env"

# C'est cette instance que tous les autres fichiers importent.
settings = Settings()