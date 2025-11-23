from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class AudioFile(Base):
    __tablename__ = "audio_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    s3_key = Column(String, unique=True, nullable=False)
    duration = Column(Float, nullable=True)
    content_type = Column(String, nullable=True)
