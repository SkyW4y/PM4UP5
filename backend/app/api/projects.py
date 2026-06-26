from fastapi import APIRouter, status, Depends, HTTPException, Response

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, update

from app import schemas, models
from app.database import get_async_db
from app.depends import auth

async def check_project_access(user_id: int, project_id ,db: AsyncSession) -> bool:
    stmt = (
        select(models.ProjectGroup.id)
        .where(
            models.ProjectGroup.project_id == project_id,
            models.ProjectGroup.user_id == user_id
        )
    )
    result = await db.execute(stmt)
    return result.scalar() is not None

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
            selectinload(models.Project.project_group_links).selectinload(models.ProjectGroup.user),
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
            selectinload(models.Project.project_group_links).selectinload(models.ProjectGroup.user),
            selectinload(models.Project.columns).selectinload(models.ProjectColumn.cards)
        )
    )
    result = await db.execute(stmt)
    full_project = result.scalars().one()
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


@router.get("/{project_id}/columns/{column_id}/cards/{card_id}", response_model=schemas.CardFull, status_code=status.HTTP_200_OK)
async def read_project_column(
        column_id: int,
        project_id: int,
        card_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение Карточки(для начальной загрузки и обновления)
    """
    if not await check_project_access(current_user.id, project_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this project")

    stmt = (
        select(models.Card)
        .where(models.Card.id == card_id, models.Card.column_id == column_id)
        .options(
            selectinload(models.ProjectColumn.cards),
        )
    )

    result = await db.execute(stmt)
    column = result.scalars().first()
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="card not found")

    return column

@router.post("/{project_id}/columns", response_model=schemas.ProjectColumnFull, status_code=status.HTTP_201_CREATED)
async def create_project_column(
        project_id: int,
        column_in: schemas.ProjectColumnCreate,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Создание нового столбца в проекте (автоматически добавляется в конец)
    """
    if not await check_project_access(current_user.id, project_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project"
        )

    max_pos_stmt = select(func.max(models.ProjectColumn.position)).where(models.ProjectColumn.project_id == project_id)
    max_pos_result = await db.execute(max_pos_stmt)
    max_pos = max_pos_result.scalar()
    next_position = (max_pos + 1) if max_pos is not None else 0

    db_column = models.ProjectColumn(
        **column_in.model_dump(),
        position=next_position,
        project_id=project_id
    )
    db.add(db_column)
    await db.commit()

    stmt = (
        select(models.ProjectColumn)
        .where(models.ProjectColumn.id == db_column.id)
        .options(selectinload(models.ProjectColumn.cards))
    )
    result = await db.execute(stmt)
    return result.scalars().first()

@router.post("/{project_id}/columns/{column_id}/cards", response_model=schemas.CardFull, status_code=status.HTTP_201_CREATED)
async def create_card(
        project_id: int,
        column_id: int,
        card_in: schemas.CardCreate,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Создание карточки внутри определенного столбца
    """
    if not await check_project_access(current_user.id, project_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project"
        )

    col_check_stmt = select(models.ProjectColumn).where(
        models.ProjectColumn.id == column_id,
        models.ProjectColumn.project_id == project_id
    )
    col_check_result = await db.execute(col_check_stmt)
    if not col_check_result.scalar():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found in this project"
        )

    max_pos_stmt = select(func.max(models.Card.position)).where(models.Card.column_id == column_id)
    max_pos_result = await db.execute(max_pos_stmt)
    max_pos = max_pos_result.scalar()
    next_position = (max_pos + 1) if max_pos is not None else 0

    db_card_data = card_in.model_dump()
    db_card_data.pop('position', None)
    db_card = models.Card(
        **db_card_data,
        position=next_position,
        column_id=column_id
    )
    db.add(db_card)
    await db.commit()

    stmt = (
        select(models.Card)
        .where(models.Card.id == db_card.id)
        .options(
            selectinload(models.Card.responsible),
            selectinload(models.Card.comments)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().first()

@router.patch("/{project_id}/delta", status_code=status.HTTP_204_NO_CONTENT)
async def patch_project_delta(
        project_id: int,
        delta: schemas.ProjectDeltaRequest,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Обновление доски по кускам в JSON
    """
    if not await check_project_access(current_user.id, project_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project"
        )

    delta_data = delta.model_dump(exclude_unset=True)

    project_updates = {k: v for k, v in delta_data.items() if k not in ("columns", "cards")}
    if project_updates:
        await db.execute(
            update(models.Project)
            .where(models.Project.id == project_id)
            .values(**project_updates)
        )

    if delta.columns:
        for col in delta.columns:
            col_data = col.model_dump(exclude_unset=True)
            col_id = col_data.pop("id")

            if col_data:
                await db.execute(
                    update(models.ProjectColumn)
                    .where(
                        models.ProjectColumn.id == col_id,
                        models.ProjectColumn.project_id == project_id
                    )
                    .values(**col_data)
                )

    if delta.cards:
        allowed_columns_subquery = select(models.ProjectColumn.id).where(
            models.ProjectColumn.project_id == project_id
        )

        for card in delta.cards:
            card_data = card.model_dump(exclude_unset=True)
            card_id = card_data.pop("id")

            if card_data:
                if "column_id" in card_data and card_data["column_id"] is not None:
                    col_check = await db.execute(
                        select(models.ProjectColumn.id)
                        .where(
                            models.ProjectColumn.id == card_data["column_id"],
                            models.ProjectColumn.project_id == project_id
                        )
                    )
                    if not col_check.scalar():
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Target column {card_data['column_id']} does not belong to this project"
                        )

                await db.execute(
                    update(models.Card)
                    .where(
                        models.Card.id == card_id,
                        models.Card.column_id.in_(allowed_columns_subquery)
                    )
                    .values(**card_data)
                )

    await db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.group_id == current_user.group_id
    )
    result = await db.execute(stmt)
    project = result.scalars().first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have access to this project"
        )

    await db.delete(project)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete("/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column(
    column_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    stmt = (
        select(models.ProjectColumn)
        .join(models.Project)
        .where(
            models.ProjectColumn.id == column_id,
            models.Project.group_id == current_user.group_id
        )
    )
    result = await db.execute(stmt)
    column = result.scalars().first()

    if not column:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Column not found or you don't have access to this project"
        )

    await db.delete(column)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    stmt = (
        select(models.Card)
        .join(models.ProjectColumn)
        .join(models.Project)
        .where(
            models.Card.id == card_id,
            models.Project.group_id == current_user.group_id
        )
    )
    result = await db.execute(stmt)
    card = result.scalars().first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found or you don't have access to this project"
        )

    await db.delete(card)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{project_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_user_to_project(
        project_id: int,
        user_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Добавление пользователя из своей группы в участники проекта
    """
    if not await check_project_access(current_user.id, project_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project"
        )

    target_user_stmt = select(models.User).where(
        models.User.id == user_id,
        models.User.group_id == current_user.group_id
    )
    target_user_result = await db.execute(target_user_stmt)
    target_user = target_user_result.scalars().first()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or does not belong to your group"
        )

    existing_link_stmt = select(models.ProjectGroup).where(
        models.ProjectGroup.project_id == project_id,
        models.ProjectGroup.user_id == user_id
    )
    existing_link_result = await db.execute(existing_link_stmt)
    if existing_link_result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this project"
        )

    new_member = models.ProjectGroup(
        project_id=project_id,
        user_id=user_id
    )
    db.add(new_member)
    await db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/{project_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_user_from_project(
        project_id: int,
        user_id: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Удаление пользователяиз участников проекта
    """
    if not await check_project_access(current_user.id, project_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this project"
        )

    link_stmt = select(models.ProjectGroup).where(
        models.ProjectGroup.project_id == project_id,
        models.ProjectGroup.user_id == user_id
    )
    link_result = await db.execute(link_stmt)
    project_user_link = link_result.scalars().first()

    if not project_user_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User is not a member of this project"
        )

    count_stmt = select(func.count(models.ProjectGroup.id)).where(
        models.ProjectGroup.project_id == project_id
    )
    count_result = await db.execute(count_stmt)
    total_members = count_result.scalar()

    if total_members <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the last member. Project must have at least one participant"
        )

    await db.delete(project_user_link)
    await db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)