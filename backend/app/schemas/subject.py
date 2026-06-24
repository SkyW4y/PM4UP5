from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List
from enum import Enum
from app.schemas.group import GroupShort


class TaskType(str, Enum):
    HOMEWORK = "homework"
    CLASSWORK = "classwork"
    PROJECT = "project"


class TaskClass(str, Enum):
    SOLO = "solo"
    GROUP = "group"


class SubjectTaskBase(BaseModel):
    task: str
    task_class: TaskClass = TaskClass.SOLO
    task_type: TaskType = TaskType.HOMEWORK
    short_description: str
    deadline: date


class SubjectTaskCreate(SubjectTaskBase):
    subject_id: int


class SubjectTaskUpdate(BaseModel):
    task: Optional[str] = None
    task_class: Optional[TaskClass] = None
    task_type: Optional[TaskType] = None
    short_description: Optional[str] = None
    deadline: Optional[date] = None


class SubjectBase(BaseModel):
    name: str


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = None


class SubjectShort(SubjectBase):
    id: int
    group_id: int

    model_config = ConfigDict(from_attributes=True)


class SubjectTaskShort(BaseModel):
    id: int
    task_class: TaskClass = TaskClass.SOLO
    task_type: TaskType = TaskType.HOMEWORK
    short_description: str
    deadline: date
    subject: SubjectShort
    is_completed: bool = False

    model_config = ConfigDict(from_attributes=True)

class SubjectTaskFull(SubjectTaskBase):
    id: int
    subject: SubjectShort
    group_id: int
    is_completed: bool = False

    model_config = ConfigDict(from_attributes=True)

class SubjectFull(SubjectShort):
    tasks: List[SubjectTaskShort] = []

    model_config = ConfigDict(from_attributes=True)