from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Enum, DATE
from sqlalchemy.orm import relationship
from app.database import Base
from enum import Enum as pyEnum


class TaskType(str, pyEnum):
    HOMEWORK = "homework"
    CLASSWORK = "classwork"
    PROJECT = "project"

class TaskClass(str, pyEnum):
    SOLO = "solo"
    GROUP = "group"

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    #TODO: добавить варианты сохранения иконок

    projects = relationship("Project", back_populates="subject", cascade="all, delete-orphan")
    group = relationship("Group", back_populates="subjects")
    tasks = relationship("SubjectTask", back_populates="subject", cascade="all, delete-orphan")

class SubjectTask(Base):
    __tablename__ = "subject_tasks"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    task = Column(String, nullable=False)
    task_class = Column(Enum(TaskClass), nullable=False, default=TaskClass.SOLO)
    task_type = Column(Enum(TaskType), nullable=False, default=TaskType.HOMEWORK)
    short_description = Column(String(255), nullable=False)
    deadline = Column(DATE, nullable=False)

    subject = relationship(
        "Subject",
        back_populates="tasks"
    )

    user_subject_tasks = relationship(
        "UserSubjTasks",
        back_populates="subject_task",
        cascade="all, delete-orphan"
    )
