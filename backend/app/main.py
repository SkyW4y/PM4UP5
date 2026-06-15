from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import api
app = FastAPI(title="Tralalela API")
# На время разработки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api.dashboard_router)
@app.get("/")
async def root():
    return {"message": "Tralalela API is running"}

