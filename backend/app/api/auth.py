from fastapi import APIRouter, status, Depends, HTTPException

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy import select

from app import schemas, models
from app.database import get_async_db
from app.depends import auth


router = APIRouter(prefix="/auth", tags=["Auth"])  # noqa


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
        user_in: schemas.UserCreate,
        db: AsyncSession = Depends(get_async_db)
):
    """
    Регистрация пользователя. Сразу выдает JWT на полгода.
    """
    stmt = select(models.User).where(
        (models.User.username == user_in.username) | (models.User.email == user_in.email)
    )
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с таким именем или email уже существует"
        )

    user_data = user_in.model_dump()
    raw_password = user_data.pop("password")

    db_user = models.User(
        **user_data,
        hashed_password=auth.hash_password(raw_password)
    )
    db.add(db_user)
    await db.flush()
    await db.commit()

    token = auth.create_jwt_token(db_user.id)

    stmt_full = select(models.User).where(models.User.id == db_user.id).options(joinedload(models.User.group_rel))
    res_full = await db.execute(stmt_full)
    current_user_full = res_full.scalar_one()

    return {"access_token": token, "user": current_user_full}


@router.post("/login", response_model=schemas.TokenResponse, status_code=status.HTTP_200_OK)
async def login_user(
        credentials: schemas.UserLogin,
        db: AsyncSession = Depends(get_async_db)
):
    """
    Авторизация пользователя (по username или email).
    Продлевает (выдает новый) JWT на полгода.
    """
    stmt = (
        select(models.User)
        .where(
            (models.User.username == credentials.username_or_email) |
            (models.User.email == credentials.username_or_email)
        )
        .options(joinedload(models.User.group_rel))
    )
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя/email или пароль"
        )

    token = auth.create_jwt_token(user.id)

    return {"access_token": token, "user": user}


@router.post("/refresh", response_model=schemas.TokenResponse, status_code=status.HTTP_200_OK)
async def refresh_jwt(
        db: AsyncSession = Depends(get_async_db),
        current_user: models.User = Depends(auth.get_current_user)
):
    """
    Обновление JWT. Пользователь шлет старый (но еще живой) токен,
    а бэк выдает новый еще на полгода вперед.
    """

    new_token = auth.create_jwt_token(current_user.id)

    stmt = select(models.User).where(models.User.id == current_user.id).options(joinedload(models.User.group_rel))
    res = await db.execute(stmt)
    user_with_group = res.scalar_one()

    return {"access_token": new_token, "user": user_with_group}