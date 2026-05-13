from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship, backref
from datetime import datetime
from .database import Base

class SimulationRequest(BaseModel):
    event: str
    change: str
    parent_id: Optional[int] = None

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
    paradox_risk: int  # Valor de 0 a 100
    risk_analysis: str
    
class UcroniaTable(Base):
    __tablename__ = "ucronias"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("ucronias.id"), nullable=True)
    original_event = Column(String)
    change = Column(String)
    # Guardamos o JSON completo para facilitar a recuperação de toda a estrutura
    content = Column(Text) 
    created_at = Column(DateTime, default=datetime.utcnow)
    children = relationship("UcroniaTable", backref=backref("parent", remote_side=[id]))