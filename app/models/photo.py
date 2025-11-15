from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    studyspot_id = Column(Integer, ForeignKey("study_spots.id"), nullable=False)
    url = Column(String, nullable=False)
    key = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to study spot
    studyspot = relationship("StudySpot", back_populates="photos")
