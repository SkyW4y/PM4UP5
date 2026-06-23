from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True, nullable=False)
    leader_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    projects = relationship("Project", back_populates="group", cascade="all, delete-orphan")

    users = relationship(
        "User",
        back_populates="group_rel",
        foreign_keys="User.group_id"
    )
    leader = relationship(
        "User",
        foreign_keys=[leader_id]
    )
    subjects = relationship(
        "Subject",
        back_populates="group",
        cascade="all, delete-orphan"
    )


