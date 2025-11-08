from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime


class Checkin(Base):
    __tablename__ = "checkin"

    checkin_id = Column(Integer, primary_key=True, index=True)
    studyspot_id = Column(Integer, ForeignKey("study_spots.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    checkin_timestamp = Column(Float, nullable=True)
    checkout_timestamp = Column(Float, nullable=True)

    # Relationships
    studyspot = relationship("StudySpot", back_populates="checkin")
    user = relationship("User", back_populates="checkin")