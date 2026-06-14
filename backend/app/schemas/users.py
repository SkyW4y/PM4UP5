from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from app.schemas.group import GroupShort


class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: str = "url"


class UserCreate(UserBase):
    password: str  # Поле для открытого пароля при регистрации
    group_id: Optional[int] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: Optional[str] = None
    group_id: Optional[int] = None


class UserShort(BaseModel):
    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: str

    model_config = ConfigDict(from_attributes=True)


class UserFull(UserBase):
    id: int
    group_id: Optional[int] = None
    group_rel: Optional[GroupShort] = None

    model_config = ConfigDict(from_attributes=True)



class UserSubjTasksBase(BaseModel):
    status: bool = False


class UserSubjTasksCreate(UserSubjTasksBase):
    subject_task_id: int
    user_id: int


class UserSubjTasksUpdate(BaseModel):
    status: bool


class UserSubjTasksResponse(UserSubjTasksBase):
    id: int
    user_id: int
    subject_task_id: int

    model_config = ConfigDict(from_attributes=True)