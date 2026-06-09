import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker, declarative_base

SYNC_DATABASE_URL = os.getenv("DATABASE_URL")
ASYNC_DATABASE_URL = SYNC_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# --- СИНХРОННЫЙ ДВИЖОК ---
sync_engine = create_engine(SYNC_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

# --- АСИНХРОННЫЙ ДВИЖОК ---
async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()

# --- DEPENDENCIES ---

# Синхронная 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Асинхронная
async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()