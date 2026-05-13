from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
import json

from .core.database import engine, Base, get_db
from .core.models import UcroniaTable, SimulationRequest
from .core.repositories import UcroniaRepository
from .core.services import HistoryService

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HistoryFork API")

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/static")

@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    """Rota principal: A Máquina do Tempo"""
    with open("app/static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/search", response_class=HTMLResponse)
async def read_search_page(request: Request):
    """Rota: A Galeria de Ucronias"""
    with open("app/static/history.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/simulate")
async def simulate(req: SimulationRequest, db: Session = Depends(get_db)):
    """Gera uma nova ucronia e salva no banco"""
    repo = UcroniaRepository(db)
    service = HistoryService(repository=repo)
    
    try:
        result = await service.generate_ucronia(req.event, req.change)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_all_history(db: Session = Depends(get_db)):
    """Retorna a lista resumida de todas as ucronias para a busca"""
    repo = UcroniaRepository(db)
    rows = repo.get_all()
    
    return [
        {
            "id": row.id,
            "event": row.original_event,
            "change": row.change,
            "date": row.created_at.isoformat()
        } for row in rows
    ]

@app.get("/history/{ucronia_id}")
async def get_ucronia_detail(ucronia_id: int, db: Session = Depends(get_db)):
    """Retorna os detalhes completos de uma ucronia específica"""
    repo = UcroniaRepository(db)
    ucronia = repo.get_by_id(ucronia_id)
    
    if not ucronia:
        raise HTTPException(status_code=404, detail="Registro temporal não encontrado")
    
    # Converte o campo 'content' (string JSON) de volta para dicionário
    return json.loads(ucronia.content)

# Lógica de delete fica para o futuro
@app.delete("/history/{ucronia_id}")
async def delete_ucronia(ucronia_id: int, db: Session = Depends(get_db)):
    repo = UcroniaRepository(db)
    return {"message": "Registro removido com sucesso"}