from fastapi import APIRouter
import subprocess, os

router = APIRouter()

@router.post("/deploy-simulated-lab")
def deploy_lab(lab_name: str = "vulnerable-web"):
    """
    Déploie un lab local via docker-compose.lab.yml dans le dossier labs.
    Pour sécurité, ce point exécute uniquement des stacks définies dans /labs.
    Ne lance rien sur des réseaux externes.
    """
    base = os.path.abspath(os.path.join(os.getcwd(), "..", "labs"))
    compose_file = os.path.join(base, "docker-compose.lab.yml")
    if not os.path.exists(compose_file):
        return {"error":"compose file missing"}
    # Appelle docker-compose en local. L'utilisateur doit exécuter dans un environnement contrôlé.
    try:
        subprocess.check_call(["docker-compose", "-f", compose_file, "up", "-d", lab_name], cwd=base)
        return {"status":"deployed", "lab": lab_name}
    except subprocess.CalledProcessError as e:
        return {"status":"error", "detail": str(e)}
