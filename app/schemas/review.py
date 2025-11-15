from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ReviewBase(BaseModel):
    studyspot_id: int
    user_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewOut(ReviewBase):
    id: int
    created_at: datetime
    # Optional reviewer display name (populated by backend when available)
    user_name: str | None = None

    class Config:
        from_attributes = True
