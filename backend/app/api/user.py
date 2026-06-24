import base64

from fastapi import APIRouter, status, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select

from app import schemas, models
from app.database import get_async_db
from app.depends import auth


router = APIRouter(prefix="/user", tags=["User actions"])  # noqa

@router.post("/group", response_model=schemas.GroupFull, status_code=status.HTTP_201_CREATED)
async def read_project(
        group_in: schemas.GroupCreate,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Получение всего проекта(для начальной загрузки и обновления)
    """
    if current_user.group_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is already a member of the group")

    group_data = group_in.model_dump()
    group_data.pop("leader_id", None)

    db_group = models.Group(
        **group_data,
        leader_id=current_user.id
    )
    db.add(db_group)
    await db.flush()
    current_user.group_id = db_group.id
    await db.commit()
    stmt = (
        select(models.Group)
        .where(models.Group.id == db_group.id)
        .options(
            selectinload(models.Group.leader),
            selectinload(models.Group.users)
        )
    )
    result = await db.execute(stmt)
    new_group = result.scalars().one()

    return new_group

@router.delete("/group/{uid}", response_model=schemas.GroupFull, status_code=status.HTTP_200_OK)
async def delete_user(
        uid: int,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Удаление пользователя по id из группы
    """
    if not current_user.group_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not a member of the group")
    stmt_group = (
        select(models.Group)
        .where(models.Group.id == current_user.group_id)
        .options(
            selectinload(models.Group.users),
            selectinload(models.Group.leader)
        )
    )
    group_result = await db.execute(stmt_group)
    group = group_result.scalars().one_or_none()

    if not group or group.leader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a leader of the group"
        )
    if uid == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User cannot done self delete in group"
        )

    stmt_user = (
        select(models.User)
        .where(models.User.id == uid, models.User.group_id == group.id)
    )
    users_result = await db.execute(stmt_user)
    target_user = users_result.scalars().one_or_none()

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in this group"
        )

    target_user.group_id = None
    db.add(target_user)

    if target_user in group.users:
        group.users.remove(target_user)

    await db.commit()
    return group


@router.get("/group/invite-link", status_code=status.HTTP_200_OK)
async def generate_invite_link(
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Генерация ссылки-приглашения
    """
    if not current_user.group_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a member of the group"
        )

    # Костыль
    group_id_str = f"group_id:{current_user.group_id}"
    encoded_bytes = base64.b64encode(group_id_str.encode("utf-8"))
    invite_code = encoded_bytes.decode("utf-8")

    # TODO: Добавить в env будущий домен сервера
    invite_url = f"http://localhost:5173/invite/{invite_code}"

    return {"invite_code": invite_code, "invite_url": invite_url}


@router.post("/group/join/{invite_code}", status_code=status.HTTP_200_OK)
async def join_group_by_invite(
        invite_code: str,
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Вступление в группу по ссылке
    """
    if current_user.group_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already joined this group"
        )

    try:
        decoded_bytes = base64.b64decode(invite_code.encode("utf-8"))
        decoded_str = decoded_bytes.decode("utf-8")

        group_id = int(decoded_str.split(":", 1)[1])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid invite code"
        )


    stmt = select(models.Group).where(models.Group.id == group_id)
    result = await db.execute(stmt)
    group = result.scalar_one_or_none()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Группа по этой ссылке больше не существует"
        )

    current_user.group_id = group.id
    db.add(current_user)

    await db.commit()

    return {"detail": f"Успешно! Вы добавлены в группу '{group.name}'"}