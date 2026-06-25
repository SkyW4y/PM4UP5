from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import Optional, List
from app.schemas.users import UserShort
from app.schemas import SubjectShort


class CommentBase(BaseModel):
    text: str


class CommentCreate(CommentBase):
    card_id: int


class CommentUpdate(BaseModel):
    text: str


class CommentResponse(CommentBase):
    id: int
    created_at: datetime
    card_id: int
    user_id: int
    user: UserShort

    model_config = ConfigDict(from_attributes=True)


class CardBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline_date: Optional[datetime] = None
    color: Optional[str] = None
    position: int = 0


class CardCreate(CardBase):
    column_id: int


class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline_date: Optional[datetime] = None
    color: Optional[str] = None
    position: Optional[int] = None
    column_id: Optional[int] = None
    responsible_id: Optional[int] = None


class CardShort(CardBase):
    id: int
    column_id: int
    responsible_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class CardFull(CardShort):
    responsible: Optional[UserShort] = None
    comments: List[CommentResponse] = []

    model_config = ConfigDict(from_attributes=True)


class ProjectColumnBase(BaseModel):
    name: str
    position: int = 0


class ProjectColumnCreate(BaseModel):
    name: str


class ProjectColumnUpdate(BaseModel):
    name: Optional[str] = None
    position: Optional[int] = None


class ProjectColumnFull(ProjectColumnBase):
    id: int
    project_id: int
    cards: List[CardShort] = []

    model_config = ConfigDict(from_attributes=True)


class ProjectBase(BaseModel):
    name: str


class ProjectCreate(ProjectBase):
    group_id: Optional[int] = None
    subject_id: int
    deadline: date


class ProjectUpdate(BaseModel):
    name: Optional[str] = None

class ProjectShort(ProjectBase):
    id: int
    group_id: int
    subject: SubjectShort
    deadline: date
    project_group: List[UserShort] = []
    progress_percent: int
    model_config = ConfigDict(from_attributes=True)


class ProjectFull(ProjectShort):
    columns: List[ProjectColumnFull] = []
    model_config = ConfigDict(from_attributes=True)

class ColumnDelta(BaseModel):
    id: int
    name: Optional[str] = None
    position: Optional[int] = None

class CardDelta(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    deadline_date: Optional[datetime] = None
    color: Optional[str] = None
    position: Optional[int] = None
    column_id: Optional[int] = None
    responsible_id: Optional[int] = None

class ProjectDeltaRequest(BaseModel):
    name: Optional[str] = None
    deadline: Optional[date] = None
    columns: Optional[List[ColumnDelta]] = None
    cards: Optional[List[CardDelta]] = None