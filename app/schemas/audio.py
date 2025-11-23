from pydantic import BaseModel
from typing import Optional

class AudioFileBase(BaseModel):
    filename: str
    duration: Optional[float] = None
    content_type: Optional[str] = None

class AudioFileCreate(AudioFileBase):
    pass

class AudioFile(AudioFileBase):
    id: int
    s3_key: str
    url: Optional[str] = None

    class Config:
        orm_mode = True
