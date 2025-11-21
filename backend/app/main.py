from fastapi import FastAPI
from app.core.config import settings
# LIGNE 1 : Avant, vous aviez 'from app.api import auth, modules, labs, ctf, simulation, audit, utils'
# J'ai retiré 'simulation' de la liste car c'est le nom qui cause l'erreur (le fichier est manquant).
from app.api import auth, modules, labs, ctf, audit, utils 

# Initialisation de l'application FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Inclusion des Routeurs
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["Authentication"])
app.include_router(modules.router, prefix=settings.API_V1_STR, tags=["Modules"])
app.include_router(labs.router, prefix=settings.API_V1_STR, tags=["Labs"])
app.include_router(ctf.router, prefix=settings.API_V1_STR, tags=["CTF"])
# LIGNE 2 : J'ai mis en commentaire l'enregistrement du routeur 'simulation' pour éviter l'erreur.
# app.include_router(simulation.router, prefix=settings.API_V1_STR, tags=["Simulation"]) 
app.include_router(audit.router, prefix=settings.API_V1_STR, tags=["Audit"])
app.include_router(utils.router, prefix=settings.API_V1_STR, tags=["Utilities"])

@app.get("/")
def read_root():
    """Point de contrôle de santé de base."""
    return {"message": "Bienvenue dans l'API Backend de Kali-lite"}

# Ajoutez d'autres middlewares ou gestionnaires d'événements ici si nécessaire