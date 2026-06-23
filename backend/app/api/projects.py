from fastapi import APIRouter, status, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app import schemas, models
from app.database import get_async_db
from app.depends import auth


router = APIRouter(prefix="/projects", tags=["Project"])  # noqa

@router.get("/project/{project_id}", response_model=schemas.ProjectFull, status_code=status.HTTP_200_OK)
async def read_project(
        project_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение всего проекта(для начальной загрузки и обновления)
    """
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

    user_ids_in_project = [pg.user_id for pg in project.project_group]
    if current_user.id not in user_ids_in_project:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No acess to this project")

    return project
