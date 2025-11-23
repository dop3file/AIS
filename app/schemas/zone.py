from pydantic import BaseModel
from typing import Optional

class BroadcastZoneBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: Optional[str] = None

class BroadcastZoneCreate(BroadcastZoneBase):
    pass

class BroadcastZoneUpdate(BroadcastZoneBase):
    name: Optional[str] = None

class BroadcastZone(BroadcastZoneBase):
    id: int

    class Config:
        orm_mode = True
