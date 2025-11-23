from fastapi import APIRouter

from app.api.v1.endpoints import zones, audio, notifications

api_router = APIRouter()
api_router.include_router(zones.router, prefix="/zones", tags=["zones"])
api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
