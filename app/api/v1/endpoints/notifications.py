from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.notification import Notification as NotificationModel
from app.schemas.notification import Notification, NotificationCreate, NotificationUpdate

router = APIRouter()

@router.post("/", response_model=Notification)
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    db_notification = NotificationModel(
        message=notification.message,
        scheduled_time=notification.scheduled_time,
        audio_file_id=notification.audio_file_id,
        zone_id=notification.zone_id
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.get("/", response_model=List[Notification])
def read_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    notifications = db.query(NotificationModel).offset(skip).limit(limit).all()
    return notifications

@router.get("/{notification_id}", response_model=Notification)
def read_notification(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(NotificationModel).filter(NotificationModel.id == notification_id).first()
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification
