from sqlalchemy import Column, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class SpotStatus(enum.Enum):
    pending = "pending"
    active = "active"
    closed = "closed"


class StudySpot(Base):
    __tablename__ = "study_spots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    place_id = Column(String, unique=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(SpotStatus), default=SpotStatus.pending)
    description = Column(String, nullable=True)

    # Relationships
    reviews = relationship("Review", back_populates="studyspot")
    checkin = relationship("Checkin", back_populates="studyspot")
