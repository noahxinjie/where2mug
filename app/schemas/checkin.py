from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class CheckinBase(BaseModel):
    studyspot_id: int
    user_id: int
    checkin_timestamp: Optional[float] = None
    checkout_timestamp: Optional[float] = None

class CheckinCreate(CheckinBase):
    pass

class CheckinOut(CheckinBase):
    checkin_id: int

    class Config:
        from_attributes = True

class UserCheckinRequest(BaseModel):
    studyspot_id: int
    user_id: int