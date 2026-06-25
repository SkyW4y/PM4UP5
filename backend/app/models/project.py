from sqlalchemy import Column, Integer, String, ForeignKey, Text, DATE, DateTime
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import relationship
from app.database import Base

from datetime import datetime

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    deadline = Column(DATE, nullable=False)

    subject = relationship(
        "Subject",
        back_populates="projects",
    )
    group = relationship(
        "Group",
        back_populates="projects"
    )
    columns = relationship(
        "ProjectColumn",
        back_populates="project",
        cascade="all, delete-orphan"
    )
    project_group_links = relationship(
        "ProjectGroup",
        back_populates="project",
        cascade="all, delete-orphan"
    )

    @property
    def project_group(self):
        return [link.user for link in self.project_group_links if link.user]

    @property
    def project_groups(self):
        return self.project_group

    @property
    def progress_percent(self) -> int:
        return 0

class ProjectGroup(Base):
    __tablename__ = "project_groups"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    project = relationship(
        "Project",
        back_populates="project_group_links"
    )
    user = relationship(
        "User",
        back_populates="project_group_rel",
    )

class ProjectColumn(Base):
    __tablename__ = "project_columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), nullable=False)
    position = Column(Integer, default=0, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    project = relationship("Project", back_populates="columns")
    cards = relationship("Card", back_populates="column", cascade="all, delete-orphan", order_by="Card.position")


class Card(Base):
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)
    deadline_date = Column(DateTime, nullable=True)
    color = Column(String(7), nullable=True) # HEX код
    position = Column(Integer, default=0, nullable=False)
    
    column_id = Column(Integer, ForeignKey("project_columns.id"), nullable=False)
    responsible_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    column = relationship("ProjectColumn", back_populates="cards")
    responsible = relationship("User", back_populates="assigned_cards")  # Кто делает/ответственный
    comments = relationship("Comment", back_populates="card", cascade="all, delete-orphan", order_by="Comment.created_at")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    card = relationship("Card", back_populates="comments")
    user = relationship("User")