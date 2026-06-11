from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), unique=True, index=True, nullable=False)
    users = relationship("User", back_populates="group_rel")