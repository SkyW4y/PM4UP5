from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from enum import Enum


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(128), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(128), nullable=True)
    last_name = Column(String(128), nullable=True)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    tasks = relationship("UserSubjTasks", back_populates="user", cascade="all, delete-orphan")
    avatar = Column(String(2048), nullable=False, default="url")

    group_rel = relationship(
        "Group",
        back_populates="users",
        foreign_keys=[group_id]
    )

class UserSubjTasks(Base):
    __tablename__ = "user_subject_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_task_id = Column(Integer, ForeignKey("subject_tasks.id"), nullable=False)
    status = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="user_subject_tasks")
    subject_task = relationship("SubjectTask", back_populates="user_subject_tasks")