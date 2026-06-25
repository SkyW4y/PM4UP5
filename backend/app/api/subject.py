from fastapi import APIRouter, status, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, update

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
    if current_user.group_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You dont exist in any group")
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

@router.patch("/{subject_id}/delta", status_code=status.HTTP_204_NO_CONTENT)
async def patch_subject_delta(
        subject_id: int,
        delta: schemas.SubjectDeltaRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Массовое обновление предмета: изменение названия и/или редактирование его задач
    """
    subject_stmt = select(models.Subject).where(
        models.Subject.id == subject_id,
        models.Subject.group_id == current_user.group_id
    )
    subject_result = await db.execute(subject_stmt)
    if not subject_result.scalar():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subject not found or you do not have access to it"
        )

    delta_data = delta.model_dump(exclude_unset=True)

    if "name" in delta_data:
        name_check = await db.execute(
            select(models.Subject).where(
                models.Subject.name == delta.name,
                models.Subject.group_id == current_user.group_id,
                models.Subject.id != subject_id
            )
        )
        if name_check.scalar():
            raise HTTPException(status_code=400, detail="Subject with this name already exists in your group")

        await db.execute(
            update(models.Subject)
            .where(models.Subject.id == subject_id)
            .values(name=delta.name)
        )

    if delta.tasks:
        for task in delta.tasks:
            task_data = task.model_dump(exclude_unset=True)
            task_id = task_data.pop("id")

            if task_data:
                result = await db.execute(
                    update(models.SubjectTask)
                    .where(
                        models.SubjectTask.id == task_id,
                        models.SubjectTask.subject_id == subject_id
                    )
                    .values(**task_data)
                )

                if result.rowcount == 0:
                    await db.rollback()
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Task with id {task_id} does not belong to subject {subject_id} or does not exist"
                    )

    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/tasks", response_model=schemas.SubjectTaskFull, status_code=status.HTTP_201_CREATED)
async def create_subject_task(
        task_in: schemas.SubjectTaskCreate,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Создание задачи для предмета + автоматическая привязка ко всем студентам группы
    """
    subject_stmt = select(models.Subject).where(
        models.Subject.id == task_in.subject_id,
        models.Subject.group_id == current_user.group_id
    )
    subject_result = await db.execute(subject_stmt)
    subject = subject_result.scalars().first()

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subject not found or does not belong to your group"
        )

    db_task = models.SubjectTask(**task_in.model_dump())
    db.add(db_task)
    await db.flush()

    users_stmt = select(models.User.id).where(models.User.group_id == current_user.group_id)
    users_result = await db.execute(users_stmt)
    user_ids = users_result.scalars().all()

    if user_ids:
        user_tasks_mappings = [
            {"user_id": u_id, "subject_task_id": db_task.id, "status": False}
            for u_id in user_ids
        ]
        await db.execute(
            insert(models.UserSubjTasks),
            user_tasks_mappings
        )

    await db.commit()

    stmt = (
        select(models.SubjectTask)
        .where(models.SubjectTask.id == db_task.id)
        .options(selectinload(models.SubjectTask.subject))
    )
    result = await db.execute(stmt)
    saved_task = result.scalars().first()

    return schemas.SubjectTaskFull(
        id=saved_task.id,
        task=saved_task.task,
        task_class=saved_task.task_class,
        task_type=saved_task.task_type,
        short_description=saved_task.short_description,
        deadline=saved_task.deadline,
        subject=schemas.SubjectShort.model_validate(saved_task.subject),
        group_id=current_user.group_id,
        is_completed=False
    )

