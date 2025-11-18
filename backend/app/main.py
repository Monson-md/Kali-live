from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, modules, labs, ctf, simulation, audit, utils # J'ai renommé simulator en simulation, et ajouté utils si vous en avez besoin.
# Si vous avez un routeur nommé 'log_parser.py' (pour /parse-logs) ou autre, vous pouvez l'ajouter ici.

app = FastAPI(title="Kali-Lite (educational)")

# --- 1. Configuration CORS ---
# Permet au frontend (qui est sur un port différent, ex: 3000) de communiquer avec le backend (ex: 8000).

# Pour un environnement de développement local sécurisé, nous allons autoriser les connexions depuis :
# 1. localhost (pour le développement standard)
# 2. 127.0.0.1 (une autre forme de localhost)
# 3. Tout port si c'est nécessaire pour le conteneur Docker (ajustez si besoin)

origins = [
    "http://localhost",
    "http://localhost:3000",  # Port typique de Vite/React
    "http://localhost:5173",  # Un autre port courant pour Vite/React
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*" # DANGER! En production, N'UTILISEZ PAS "*" mais l'URL exacte de votre frontend.
        # Nous l'utilisons ici pour la flexibilité du développement.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les méthodes (GET, POST, etc.)
    allow_headers=["*"],  # Autorise tous les headers (y compris Authorization pour le JWT)
)


# --- 2. Configuration des routeurs ---
app.include_router(auth.router, tags=["Authentication"])
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(labs.router, prefix="/labs", tags=["Labs"])
app.include_router(ctf.router, prefix="/ctf", tags=["CTF"])
app.include_router(simulation.router, prefix="/sim", tags=["Simulation"])
app.include_router(audit.router, prefix="/audit", tags=["Audit"])
app.include_router(utils.router, prefix="/utils", tags=["Utils"]) # Si vous utilisez utils.py comme un routeur

@app.get("/")
def root():
    return {"app":"kali-lite", "mode":"educational", "note":"Aucune fonctionnalité offensive n'est exposée."}

# --- Note Importante sur l'Importation des Routeurs ---
# Dans votre structure, les fichiers de routeurs sont dans backend/app/api/.
# Pour l'importation ci-dessus (`from app.api import auth`), il faut que le module Python qui lance l'application
# sache où est le module 'app'. Si vous lancez avec `uvicorn main:app --reload` depuis le dossier `app`,
# cela devrait fonctionner. Si vous lancez depuis le dossier `backend`, vous pourriez avoir besoin de :
# `uvicorn app.main:app --reload`