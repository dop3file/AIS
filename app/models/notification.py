from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    message = Column(String, nullable=True)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String, default=NotificationStatus.PENDING)
    
    audio_file_id = Column(Integer, ForeignKey("audio_files.id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("broadcast_zones.id"), nullable=False)

    audio_file = relationship("AudioFile")
    zone = relationship("BroadcastZone")
