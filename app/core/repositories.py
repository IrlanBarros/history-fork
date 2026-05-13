import json
from sqlalchemy.orm import Session
from .models import UcroniaTable

class UcroniaRepository:
    def __init__(self, db: Session):
        self.db = db

    def save(self, original_event: str, change: str, content_dict: dict, parent_id: int = None):
        db_ucronia = UcroniaTable(
            parent_id=parent_id,
            original_event=original_event,
            change=change,
            content=json.dumps(content_dict)
        )
        self.db.add(db_ucronia)
        self.db.commit()
        self.db.refresh(db_ucronia)
        return db_ucronia

    def get_all(self):
        return self.db.query(UcroniaTable).order_by(UcroniaTable.created_at.desc()).all()

    def get_by_id(self, ucronia_id: int):
        return self.db.query(UcroniaTable).filter(UcroniaTable.id == ucronia_id).first()