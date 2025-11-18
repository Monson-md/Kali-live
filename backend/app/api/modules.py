from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import random
import string

# Définition du modèle de données attendu pour la requête POST
class PasswordRequest(BaseModel):
    """
    Modèle pour la requête de génération de mot de passe.
    """
    length: int = Field(..., ge=8, le=128, description="Longueur du mot de passe (entre 8 et 128)")

# Définition du modèle de données pour la réponse
class PasswordResponse(BaseModel):
    """
    Modèle pour la réponse contenant le mot de passe généré.
    """
    password: str

# Initialisation du routeur
router = APIRouter()

def generate_strong_password(length: int) -> str:
    """
    Génère un mot de passe aléatoire et sécurisé.
    Il assure la présence d'au moins un chiffre, une majuscule et un caractère spécial.
    """
    # Tous les caractères possibles
    characters = string.ascii_letters + string.digits + string.punctuation
    
    # Assurer au moins un de chaque type pour la robustesse (meilleur pour l'éducation)
    password = [
        random.choice(string.digits),
        random.choice(string.ascii_uppercase),
        random.choice(string.ascii_lowercase),
        random.choice(string.punctuation),
    ]
    
    # Compléter le reste de la longueur
    for _ in range(length - 4):
        password.append(random.choice(characters))
        
    # Mélanger le mot de passe pour le rendre aléatoire
    random.shuffle(password)
    
    return "".join(password)

@router.post("/generate-password", response_model=PasswordResponse)
async def generate_password_endpoint(request: PasswordRequest):
    """
    Endpoint pour générer un mot de passe sécurisé d'une longueur spécifiée.
    """
    try:
        password = generate_strong_password(request.length)
        return PasswordResponse(password=password)
    except Exception as e:
        # En cas d'erreur inattendue (bien que peu probable ici)
        print(f"Erreur lors de la génération: {e}")
        raise HTTPException(status_code=500, detail="Échec de la génération du mot de passe.")