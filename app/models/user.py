from sqlalchemy import Column, Integer, String, Enum
from app.db.base import Base
import enum

class UserRole(enum.Enum):
    student = "student"
    business = "business"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
