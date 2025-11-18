from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter()

@router.post("/parse-logs")
async def parse_logs(file: UploadFile = File(...)):
    # Lecture en local dans l'environnement contrôlé
    content = (await file.read()).decode('utf-8', errors='ignore').splitlines()
    failed = [line for line in content if "FAILED LOGIN" in line.upper() or "AUTH FAIL" in line.upper()]
    recent = sorted(content[-500:])  # limiter la charge
    return {"total_lines": len(content), "failed_attempts": len(failed), "examples": failed[:10], "recent_tail_count": len(recent)}
