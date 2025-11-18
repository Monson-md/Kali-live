from datetime import datetime, timedelta
from typing import Optional

# Importations FastAPI et dépendances
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

# Importations de notre application (modèles Pydantic et logique de DB)
from ..models import UserCreate, UserInDB, Token, TokenData
from ..database import get_password_hash, verify_password, get_user, create_user

# Importations pour le JWT
from jose import JWTError, jwt

# --- Configuration JWT (À déplacer dans un fichier config.py/variables d'environnement pour la production) ---
SECRET_KEY = "votre-super-secrete-cle-jwt"  # REMPLACER CECI EN PRODUCTION
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 


# --- Initialisation du routeur et du schéma OAuth2 ---
router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)
# Définit le schéma de sécurité OAuth2 (FastAPI l'utilise pour extraire le token du header 'Authorization')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# --- Fonctions Utilitaires JWT ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crée un jeton d'accès JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(username: str, password: str) -> Optional[UserInDB]:
    """Tente d'authentifier l'utilisateur."""
    user = get_user(username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# --- Dépendances (Fonctions pour récupérer l'utilisateur authentifié) ---

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    """Dépendance : Extrait et valide l'utilisateur à partir du jeton JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Les identifiants ne sont pas valides",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Décodage et validation du jeton
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # Récupération de l'utilisateur dans la base de données
    user = get_user(token_data.username)
    if user is None:
        raise credentials_exception
    return user


# --- Points de Terminaison (Endpoints) ---

@router.post("/register", response_model=UserInDB)
def register_user(user_data: UserCreate):
    """Endpoint pour l'enregistrement d'un nouvel utilisateur."""
    if get_user(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nom d'utilisateur est déjà pris.",
        )

    # Hashage du mot de passe
    hashed_password = get_password_hash(user_data.password)
    
    # Création du modèle pour la DB
    user_in_db = UserInDB(
        username=user_data.username,
        hashed_password=hashed_password,
        email=user_data.email
    )
    
    # Sauvegarde dans la fausse DB
    created_user = create_user(user_in_db.__dict__) # Utilisation de .__dict__ pour simplifier l'insertion dans la fausse DB
    
    return created_user

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Endpoint pour la connexion et l'émission d'un jeton d'accès."""
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Création du jeton
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=UserInDB)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    """Endpoint protégé: Récupère les informations de l'utilisateur actuel."""
    return current_user