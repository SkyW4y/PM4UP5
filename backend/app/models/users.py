from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(128), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(128), nullable=True)
    last_name = Column(String(128), nullable=True)
    middle_name = Column(String(128), nullable=True)
    group = Column(Integer, ForeignKey("groups.id"), nullable=True)
    group_rel = relationship("Group", back_populates="users")



