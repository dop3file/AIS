from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.audio import AudioFile as AudioModel
from app.schemas.audio import AudioFile
from app.services.storage import storage_service

router = APIRouter()

@router.post("/upload", response_model=AudioFile)
async def upload_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    s3_key = await storage_service.upload_file(file)
    
    db_audio = AudioModel(
        filename=file.filename,
        s3_key=s3_key,
        content_type=file.content_type,
        duration=0.0
    )
    db.add(db_audio)
    db.commit()
    db.refresh(db_audio)
    
    url = storage_service.get_presigned_url(db_audio.s3_key)
    
    return AudioFile(
        id=db_audio.id,
        filename=db_audio.filename,
        s3_key=db_audio.s3_key,
        duration=db_audio.duration,
        content_type=db_audio.content_type,
        url=url
    )

@router.get("/", response_model=List[AudioFile])
def read_audio_files(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    files = db.query(AudioModel).offset(skip).limit(limit).all()

    result = []
    for f in files:
        url = storage_service.get_presigned_url(f.s3_key)
        result.append(AudioFile(
            id=f.id,
            filename=f.filename,
            s3_key=f.s3_key,
            duration=f.duration,
            content_type=f.content_type,
            url=url
        ))
    return result

@router.delete("/{audio_id}")
def delete_audio(audio_id: int, db: Session = Depends(get_db)):
    audio = db.query(AudioModel).filter(AudioModel.id == audio_id).first()
    if audio is None:
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    storage_service.delete_file(audio.s3_key)
    
    db.delete(audio)
    db.commit()
    return {"ok": True}
