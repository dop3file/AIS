from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.notification import NotificationStatus

class NotificationBase(BaseModel):
    message: Optional[str] = None
    scheduled_time: datetime
    audio_file_id: int
    zone_id: int
    is_recurring: Optional[bool] = False
    recurrence_pattern: Optional[str] = None
    recurrence_end_date: Optional[datetime] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    status: NotificationStatus

class Notification(NotificationBase):
    id: int
    status: NotificationStatus

    class Config:
        orm_mode = True
