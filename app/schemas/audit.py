from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import uuid4

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    event_type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = None
    details: Dict[str, Any] = {}
    severity: str = "info"

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "event_type": "user_login",
                "user_id": 1,
                "details": {"ip": "127.0.0.1"},
                "severity": "info"
            }
        }
