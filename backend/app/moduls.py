from pydantic import BaseModel, Field
from typing import Optional, List

# --- Modèles d'Authentification (Auth) ---

class UserBase(BaseModel):
    """Base pour les utilisateurs (partagée par la création et la lecture)."""
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    """Modèle utilisé pour l'enregistrement d'un nouvel utilisateur."""
    password: str = Field(..., min_length=8)
    email: Optional[str] = None # Facultatif

class UserLogin(BaseModel):
    """Modèle utilisé pour la connexion."""
    username: str
    password: str

class Token(BaseModel):
    """Modèle pour le jeton d'accès retourné après connexion."""
    access_token: str
    token_type: str = "bearer"
    
class TokenData(BaseModel):
    """Modèle pour les données contenues dans le jeton (le 'payload')."""
    username: Optional[str] = None


# --- Modèles de Représentation (DB & Réponse) ---

class UserInDB(UserBase):
    """Modèle interne pour stocker et vérifier l'utilisateur dans la base de données."""
    hashed_password: str
    email: Optional[str] = None
    # ID est souvent généré par la DB, mais on l'inclut pour la structure
    user_id: str


# --- Modèles d'Outils et Labs (Tools & Labs) ---

class ToolBase(BaseModel):
    """Base pour un outil, labo ou CTF."""
    name: str = Field(..., min_length=3)
    description: Optional[str] = None
    category: str = "CTF"  # Exemple: CTF, Labo, Password, Network
    is_active: bool = True # Pourrait représenter l'état d'un labo déployé

class ToolCreate(ToolBase):
    """Modèle pour créer un nouvel outil/labo."""
    # Hérite de ToolBase
    pass

class Tool(ToolBase):
    """Modèle complet pour un outil retourné au client (inclut l'ID)."""
    tool_id: str
    owner_id: str # L'ID de l'utilisateur qui a créé l'outil/labo
    
    class Config:
        # Ceci permet d'utiliser l'ORM mode pour lire les données de la DB
        from_attributes = True