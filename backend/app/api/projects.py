from fastapi import APIRouter, status, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, exists

from app import schemas, models
from app.database import get_async_db
from app.depends import auth

async def check_project_access(user_id: int, project_id ,db: AsyncSession) -> bool:
    stmt = (
        select(models.ProjectGroup)
        .where(
            models.ProjectGroup.project_id == project_id,
            models.ProjectGroup.user_id == user_id
        )
        .exists()
    )
    result = await db.execute(select(stmt))
    return result.scalar()

router = APIRouter(prefix="/projects", tags=["Project"])  # noqa

@router.get("/{project_id}", response_model=schemas.ProjectFull, status_code=status.HTTP_200_OK)
async def read_project(
        project_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение всего проекта(для начальной загрузки и обновления)
    """
    if not await check_project_access(current_user.id, project_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this project or project does not exist")

    stmt = (
        select(models.Project)
        .where(models.Project.id == project_id)
        .options(
            selectinload(models.Project.subject),
            selectinload(models.Project.group),
            selectinload(models.Project.project_group).selectinload(models.ProjectGroup.user),
            selectinload(models.Project.columns).selectinload(models.ProjectColumn.cards)
        )
    )

    result = await db.execute(stmt)

    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return project


@router.post("", response_model=schemas.ProjectFull, status_code=status.HTTP_201_CREATED)
async def create_project(
        project_in: schemas.ProjectCreate,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Создание проекта, автоматическое добавление создателя в участники
    и генерация дефолтных колонок для Канбан-доски
    """
    if not current_user.group_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot create a new project because you are not a member of any group"
        )
    check_project_stmt = (
        select(models.Project)
        .where(models.Project.name == project_in.name, models.Project.group_id == current_user.group_id)
        .options(
            selectinload(models.Project.subject),
        )
    )
    check = await db.execute(check_project_stmt)
    check_result = check.scalars().first()
    if check_result:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project name already exists")

    proj_data = project_in.model_dump()
    proj_data.pop("group_id", None)
    db_project = models.Project(
        **proj_data,
        group_id=current_user.group_id
    )
    db.add(db_project)

    await db.flush()

    project_member = models.ProjectGroup(
        project_id=db_project.id,
        user_id=current_user.id
    )
    db.add(project_member)

    # Генерация простого шаблона проекта
    default_columns = ["Задачи", "В работе", "Готово"]
    for index, col_name in enumerate(default_columns):
        new_column = models.ProjectColumn(
            name=col_name,
            position=index,  # Сортировка (0, 1, 2)
            project_id=db_project.id
        )
        db.add(new_column)

    await db.commit()

    stmt = (
        select(models.Project)
        .where(models.Project.id == db_project.id)
        .options(
            selectinload(models.Project.subject),
            selectinload(models.Project.group),
            selectinload(models.Project.project_group).selectinload(models.ProjectGroup.user),
            selectinload(models.Project.columns).selectinload(models.ProjectColumn.cards)
        )
    )
    result = await db.execute(stmt)
    full_project = result.scalars().one()
    print(f" -------------------- AAAAAAAAAAAAAAAAAAAAAAAAAa  - {full_project}")
    return full_project

@router.get("/{project_id}/columns/{column_id}", response_model=schemas.ProjectColumnFull, status_code=status.HTTP_200_OK)
async def read_project_column(
        project_id: int,
        column_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение столбца(для начальной загрузки и обновления)
    """
    if not await check_project_access(current_user.id, project_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this project")

    stmt = (
        select(models.ProjectColumn)
        .where(models.ProjectColumn.id == column_id, models.ProjectColumn.project_id == project_id)
        .options(
            selectinload(models.ProjectColumn.cards),
        )
    )

    result = await db.execute(stmt)
    column = result.scalars().first()
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="column not found")

    return column

