from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, Float, cast, Integer
from app.schemas.checkin import CheckinOut, CheckinCreate, UserCheckinRequest
from app.models.checkin import Checkin
from app.db.session import get_db

router = APIRouter()

@router.post("/signIn", response_model=CheckinOut)
def checkin_user(checkin: CheckinCreate, db: Session = Depends(get_db)):
    active_checkin = (
        db.query(Checkin)
        .filter(Checkin.user_id == checkin.user_id, 
            Checkin.studyspot_id == checkin.studyspot_id, 
            Checkin.checkout_timestamp.is_(None))
        .first()
    )
    if active_checkin:
        raise HTTPException(status_code=400, detail="User already checked in at this studyspot")

    checkin.checkin_timestamp = cast(func.extract("epoch", func.now()), Integer)
    new_checkin = Checkin(**checkin.model_dump())
    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)
    return new_checkin

@router.post("/signOut", response_model=CheckinOut)
def checkout_user(checkout: CheckinCreate, db: Session = Depends(get_db)):
    checkin = (
        db.query(Checkin)
        .filter(
            Checkin.user_id == checkout.user_id,
            Checkin.studyspot_id == checkout.studyspot_id,
            Checkin.checkout_timestamp.is_(None)
        )
        .first()
    )
    if not checkin:
        raise HTTPException(status_code=404, detail="No active check-in found for user at this study spot")

    checkin.checkout_timestamp = cast(func.extract("epoch", func.now()), Integer)
    db.commit()
    db.refresh(checkin)
    return checkin

@router.post("/userCheckinStatus")
def checkin_user_status(request: UserCheckinRequest, db: Session = Depends(get_db)):
    count = (
        db.query(func.count(Checkin.checkin_id))
        .filter(
            Checkin.studyspot_id == request.studyspot_id,
            Checkin.user_id == request.user_id,
            Checkin.checkout_timestamp.is_(None)
        )
        .scalar()
    )

    is_user_checkin = count > 0

    return {"studyspot_id": request.studyspot_id, "user_id": request.user_id, "is_user_checkin": is_user_checkin}

@router.post("/studyspotCheckinStatus/{studyspot_id}")
def get_active_checkins(studyspot_id: int, db: Session = Depends(get_db)):
    active_count = (
        db.query(func.count(Checkin.checkin_id))
        .filter(
            Checkin.studyspot_id == studyspot_id,
            Checkin.checkout_timestamp.is_(None)
        )
        .scalar()
    )
    return {"studyspot_id": studyspot_id, "active_checkins": active_count}