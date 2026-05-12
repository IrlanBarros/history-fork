from pydantic import BaseModel
from typing import List

class SimulationRequest(BaseModel):
    event: str
    change: str

class TimelineEvent(BaseModel):
    year: int
    event_name: str  
    description: str
    real_world_equivalent: str 
    
class ImpactLocation(BaseModel):
    lat: float
    lng: float
    label: str

class HistoryResponse(BaseModel):
    original_event: str
    divergence_point: str
    timeline: List[TimelineEvent]
    impact_locations: List[ImpactLocation]
    summary: str
    visual_record_prompt: str # Descrição detalhada para gerar a imagem
    image_url: str = None
    paradox_risk: int  # Valor de 0 a 100
    risk_analysis: str