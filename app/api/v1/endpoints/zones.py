from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.zone import BroadcastZone as ZoneModel
from app.schemas.zone import BroadcastZone as ZoneSchema, BroadcastZoneCreate, BroadcastZoneUpdate

router = APIRouter()

@router.post("/", response_model=ZoneSchema)
def create_zone(
    zone: BroadcastZoneCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_zone = ZoneModel(name=zone.name, description=zone.description, location=zone.location)
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

@router.get("/", response_model=List[ZoneSchema])
def read_zones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    zones = db.query(ZoneModel).offset(skip).limit(limit).all()
    return zones

@router.get("/{zone_id}", response_model=ZoneSchema)
def read_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(ZoneModel).filter(ZoneModel.id == zone_id).first()
    if zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone

@router.put("/{zone_id}", response_model=ZoneSchema)
def update_zone(zone_id: int, zone: BroadcastZoneUpdate, db: Session = Depends(get_db)):
    db_zone = db.query(ZoneModel).filter(ZoneModel.id == zone_id).first()
    if db_zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    for key, value in zone.dict(exclude_unset=True).items():
        setattr(db_zone, key, value)
    
    db.commit()
    db.refresh(db_zone)
    return db_zone

@router.delete("/{zone_id}")
def delete_zone(zone_id: int, db: Session = Depends(get_db)):
    zone = db.query(ZoneModel).filter(ZoneModel.id == zone_id).first()
    if zone is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return {"ok": True}
