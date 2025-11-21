from pydantic import BaseModel
from typing import Optional

# --- Modèles pour le JWT (JSON Web Token) ---

class Token(BaseModel):
    """Schéma Pydantic pour la réponse de jeton d'accès."""
    access_token: str
    token_type: str # Doit être "bearer"

class TokenData(BaseModel):
    """Schéma Pydantic pour les données contenues dans le jeton (payload)."""
    username: Optional[str] = None

# --- Modèles Utilisateur ---

class User(BaseModel):
    """Modèle de base pour un utilisateur."""
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    """Modèle pour un utilisateur tel qu'il est stocké dans la base de données (inclut le hachage du mot de passe)."""
    hashed_password: str

class UserCreate(BaseModel):
    """Modèle utilisé lors de la création d'un nouvel utilisateur (inscription)."""
    username: str
    password: str
    email: Optional[str] = None
    full_name: Optional[str] = None