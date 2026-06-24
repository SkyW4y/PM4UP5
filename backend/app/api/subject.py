from fastapi import APIRouter, status, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, exists

from app import schemas, models
from app.database import get_async_db
from app.depends import auth

router = APIRouter(prefix="/subjects", tags=["Subjects"])  # noqa

@router.get("", response_model=list[schemas.SubjectShort], status_code=status.HTTP_200_OK)
async def read_subjects(
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение всех предметов
    """
    stmt = (
        select(models.Subject)
        .where(models.Subject.group_id == current_user.group_id)
    )
    result = await db.execute(stmt)
    subjects = list(result.scalars().all())
    if not subjects:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject is empty")
    return subjects

@router.post("", response_model=schemas.SubjectShort, status_code=status.HTTP_201_CREATED)
async def create_subject(
        subject_in: schemas.SubjectCreate,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Создание предмета
    """
    check_stmt = (
        select(models.Subject)
        .where(models.Subject.name == subject_in.name, models.Subject.group_id == current_user.group_id)
    )
    check = await db.execute(check_stmt)
    check_result = check.scalars().first()
    if check_result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject already exists")

    subject_data = subject_in.model_dump()
    subject_data.pop("group_id", None)
    subject = models.Subject(**subject_data, group_id=current_user.group_id)
    db.add(subject)
    await db.flush()
    await db.commit()

    return subject

