from fastapi import APIRouter, status, Depends, HTTPException

from pydantic import BaseModel

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func

from app import schemas, models
from app.database import get_async_db
from app.depends import auth


class DashBoardStats(BaseModel):
    total_tasks: int
    completed_tasks_by_group: int
    completed_tasks_by_user: int

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])  # noqa

@router.get("/deadlines", response_model=list[schemas.SubjectTaskShort], status_code=status.HTTP_200_OK)
async def read_deadlines(
        skip: int = 0,
        limit: int = 10,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение списка дедлайнов пользователя
    """
    stmt = (
        select(models.SubjectTask, models.UserSubjTasks.status)
        .join(models.Subject)
        .outerjoin(
            models.UserSubjTasks,
            (models.UserSubjTasks.subject_task_id == models.SubjectTask.id) &
            (models.UserSubjTasks.user_id == current_user.id)
        )
        .filter(models.Subject.group_id == current_user.group_id)
        .options(selectinload(models.SubjectTask.subject))
        .order_by(models.SubjectTask.deadline.asc())
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()

    tasks_with_status = []
    for task, status_value in rows:
        task.is_completed = status_value if status_value is not None else False
        tasks_with_status.append(task)

    return tasks_with_status

@router.get("/deadlines/{deadline_id}", response_model=schemas.SubjectTaskFull, status_code=status.HTTP_200_OK)
async def read_deadline_detail(
        deadline_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение полной инфы для модалки
    """
    stmt = (
        select(models.SubjectTask, models.UserSubjTasks.status)
        .join(models.Subject)
        .outerjoin(
            models.UserSubjTasks,
            (models.UserSubjTasks.subject_task_id == models.SubjectTask.id) &
            (models.UserSubjTasks.user_id == current_user.id)
        )
        .filter(
            models.SubjectTask.id == deadline_id,
            models.Subject.group_id == current_user.group_id
        )
        .options(selectinload(models.SubjectTask.subject))
    )

    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Задача не найдена или у вас нет к нему доступа")

    task, status_value = row
    task.is_completed = status_value if status_value is not None else False
    task.group_id = task.subject.group_id

    return task


@router.get("/projects", response_model=list[schemas.ProjectShort], status_code=status.HTTP_200_OK)
async def read_projects(
        skip: int = 0,
        limit: int = 10,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение списка групповых проектов, в которых участвует текущий пользователь.
    """
    stmt = (
        select(models.Project)
        .join(models.ProjectGroup)
        .filter(models.ProjectGroup.user_id == current_user.id)
        .options(
            selectinload(models.Project.subject),
            selectinload(models.Project.project_group_links).selectinload(models.ProjectGroup.user)
        )
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    projects = result.scalars().all()

    response_projects = []

    for project in projects:
        flat_users = [pg.user for pg in project.project_group_links if pg.user]

        # TODO: Сделать нормальный подсчет прогресса, пока что это заглушка
        mock_progress = 0

        project_data = schemas.ProjectShort(
            id=project.id,
            name=project.name,  # Наследуется из ProjectBase
            group_id=project.group_id,
            deadline=project.deadline,
            subject=project.subject,
            project_group=flat_users,
            progress_percent=mock_progress # Временно
        )
        response_projects.append(project_data)
    return response_projects


@router.get("/stats", response_model=DashBoardStats, status_code=status.HTTP_200_OK)
async def get_dashboard_stats(
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение базовой статистики для расчета графиков на фронтенде.
    """

    total_tasks_stmt = (
        select(func.count(models.SubjectTask.id))
        .join(models.Subject)
        .filter(models.Subject.group_id == current_user.group_id)
    )
    total_tasks_res = await db.execute(total_tasks_stmt)
    total_tasks = total_tasks_res.scalar_one() or 0

    completed_group_stmt = (
        select(func.count(models.UserSubjTasks.id))
        .join(models.User, models.UserSubjTasks.user_id == models.User.id)
        .filter(
            models.User.group_id == current_user.group_id,
            models.UserSubjTasks.status == True
        )
    )
    completed_group_res = await db.execute(completed_group_stmt)
    completed_tasks_by_group = completed_group_res.scalar_one() or 0

    completed_user_stmt = (
        select(func.count(models.UserSubjTasks.id))
        .join(models.SubjectTask)
        .join(models.Subject)
        .filter(
            models.Subject.group_id == current_user.group_id,
            models.UserSubjTasks.user_id == current_user.id,
            models.UserSubjTasks.status == True
        )
    )
    completed_user_res = await db.execute(completed_user_stmt)
    completed_tasks_by_user = completed_user_res.scalar_one() or 0

    return DashBoardStats(
        total_tasks=total_tasks,
        completed_tasks_by_group=completed_tasks_by_group,
        completed_tasks_by_user=completed_tasks_by_user
    )