from typing import Dict, Optional
from passlib.context import CryptContext
import uuid

# Nous devrons créer ce fichier models.py juste après.
# Pour le moment, nous allons le copier ici si vous ne l'avez pas déjà fait.

# --- Définition temporaire de UserInDB pour éviter l'erreur d'import ---
# Si vous avez déjà créé backend/app/models.py, ignorez ce bloc.
class UserInDB:
    def __init__(self, username, hashed_password, user_id=None, email=None):
        self.username = username
        self.hashed_password = hashed_password
        self.email = email
        self.user_id = user_id if user_id else str(uuid.uuid4())

# --- Configuration du hashage des mots de passe ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Fausse Base de Données en Mémoire ---
# Simule une collection d'utilisateurs
# Clé: Nom d'utilisateur (str), Valeur: Objet UserInDB
FAKE_USERS_DB: Dict[str, UserInDB] = {}


# --- Fonctions Utilitaires ---

def get_password_hash(password: str) -> str:
    """Retourne le hash bcrypt d'un mot de passe."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe clair correspond au hash stocké."""
    return pwd_context.verify(plain_password, hashed_password)

def get_user(username: str) -> Optional[UserInDB]:
    """Récupère un utilisateur par son nom d'utilisateur."""
    # Simule la recherche dans la DB
    user_data = FAKE_USERS_DB.get(username)
    if user_data:
        return user_data
    return None

def create_user(user_data: dict) -> UserInDB:
    """Ajoute un nouvel utilisateur à la fausse base de données."""
    username = user_data['username']
    
    if username in FAKE_USERS_DB:
        raise ValueError("L'utilisateur existe déjà.")
    
    # Création de l'objet UserInDB
    user = UserInDB(
        username=username, 
        hashed_password=user_data['hashed_password'],
        email=user_data.get('email')
    )
    
    FAKE_USERS_DB[username] = user
    return user