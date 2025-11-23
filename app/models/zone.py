from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class BroadcastZone(Base):
    __tablename__ = "broadcast_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=True)
