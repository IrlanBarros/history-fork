from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .models import SimulationRequest
from .services import HistoryService

app = FastAPI()
service = HistoryService()

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse('app/static/index.html')

@app.post("/simulate")
async def simulate(req: SimulationRequest):
    result = await service.generate_ucronia(req.event, req.change)
    return result