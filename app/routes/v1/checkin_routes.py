from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.schemas.checkin import CheckinOut, CheckinCreate
from app.models.checkin import Checkin
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=CheckinOut)
def checkin_user(checkin: CheckinCreate, db: Session = Depends(get_db)):
    active_checkin = (
        db.query(Checkin)
        .filter(Checkin.user_id == checkin.user_id, 
            Checkin.studyspot_id == data.studyspot_id, 
            Checkin.checkout_timestamp.is_(None))
        .first()
    )
    if active_checkin:
        raise HTTPException(status_code=400, detail="User already checked in at this studyspot")

    # Create new check-in
    new_checkin = Checkin(**data.model_dump())
    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)
    return new_checkin

@router.post("/checkout", response_model=CheckinOut)
def checkout_user(user_id: int, studyspot_id: int, db: Session = Depends(get_db)):
    checkin = (
        db.query(Checkin)
        .filter(
            Checkin.user_id == user_id,
            Checkin.studyspot_id == studyspot_id,
            Checkin.checkout_timestamp.is_(None)
        )
        .first()
    )
    if not checkin:
        raise HTTPException(status_code=404, detail="No active check-in found for user at this study spot")

    # Mark checkout timestamp
    checkin.checkout_timestamp = func.extract("epoch", func.now())
    db.commit()
    db.refresh(checkin)
    return checkin

@router.post("/active/{studyspot_id}")
def get_active_checkins(studyspot_id: int, db: Session = Depends(get_db)):
    count = (
        db.query(func.count(Checkin.checkin_id))
        .filter(
            Checkin.studyspot_id == studyspot_id,
            Checkin.checkout_timestamp.is_(None)
        )
        .scalar()
    )
    return {"studyspot_id": studyspot_id, "active_checkins": count}