from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.notification import Notification as NotificationModel
from app.schemas.notification import Notification as NotificationSchema, NotificationCreate, NotificationUpdate

router = APIRouter()

@router.post("/", response_model=NotificationSchema)
def create_notification(
    notification: NotificationCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    db_notification = NotificationModel(
        message=notification.message,
        scheduled_time=notification.scheduled_time,
        audio_file_id=notification.audio_file_id,
        zone_id=notification.zone_id,
        is_recurring=notification.is_recurring,
        recurrence_pattern=notification.recurrence_pattern,
        recurrence_end_date=notification.recurrence_end_date
    )
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

@router.get("/", response_model=List[NotificationSchema])
def read_notifications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    notifications = db.query(NotificationModel).offset(skip).limit(limit).all()
    return notifications
