from pydantic import BaseModel
from enum import Enum

class SpotStatus(str, Enum):
    pending = "pending"
    active = "active"
    closed = "closed"


class StudySpotBase(BaseModel):
    name: str
    place_id: str
    latitude: float
    longitude: float
    status: SpotStatus = SpotStatus.pending
    description: str | None = None

class StudySpotCreate(StudySpotBase):
    pass

class StudySpotOut(StudySpotBase):
    id: int

    class Config:
        from_attributes = True
