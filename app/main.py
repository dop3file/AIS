from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.api.api import api_router
from app.core.database import engine, Base

import time
from sqlalchemy.exc import OperationalError


max_retries = 5
retry_delay = 2

for i in range(max_retries):
    try:
        Base.metadata.create_all(bind=engine)
        break
    except OperationalError as e:
        if i == max_retries - 1:
            raise e
        time.sleep(retry_delay)

app = FastAPI(title=settings.PROJECT_NAME)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "University Audio System API is running"}
