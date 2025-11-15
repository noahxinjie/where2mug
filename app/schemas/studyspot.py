from pydantic import BaseModel
from enum import Enum
from typing import Optional
from datetime import datetime

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
    active_checkins: Optional[int] = 0  

    class Config:
        from_attributes = True

    # Computed fields (not stored on the model) returned by search endpoints
    avg_rating: float | None = None
    distance_km: float | None = None
    active_checkins: int | None = None
    # Photos associated with the study spot (list of PhotoOut)
    photos: list["PhotoOut"] | None = None


# Top-level PhotoOut model so routes can return model instances with from_orm
class PhotoOut(BaseModel):
    id: int
    url: str
    key: str
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True
