from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_async_db
from app import models


# Временная заглушка
async def get_current_user(db: AsyncSession = Depends(get_async_db)) -> models.User:
    # Просто беру самого первого юзера из базы, чтобы у фронта всё работало
    stmt = select(models.User).filter(models.User.id == 1)
    result = await db.execute(stmt)
    user: models.User | None = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="Создай юзера с id=1 в БД!")

    return user