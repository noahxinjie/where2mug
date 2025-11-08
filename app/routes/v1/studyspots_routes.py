from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.studyspot import StudySpotCreate, StudySpotOut
from app.models.studyspot import StudySpot
from app.models.checkin import Checkin
from app.db.session import get_db
from sqlalchemy import func

router = APIRouter()

@router.post("/", response_model=StudySpotOut)
def create_study_spot(spot: StudySpotCreate, db: Session = Depends(get_db)):
    existing = db.query(StudySpot).filter(StudySpot.place_id == spot.place_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Study spot already exists")
    new_spot = StudySpot(**spot.model_dump())
    db.add(new_spot)
    db.commit()
    db.refresh(new_spot)
    return new_spot

@router.get("/", response_model=list[StudySpotOut])
def list_study_spots(db: Session = Depends(get_db)):
    spots = db.query(StudySpot).all()
    result = []
    for spot in spots:
        active_count = (
            db.query(func.count(Checkin.checkin_id))
            .filter(Checkin.studyspot_id == spot.id, Checkin.checkout_timestamp == None)
            .scalar()
        )
        spot_data = StudySpotOut.from_orm(spot)
        spot_data.active_checkins = active_count
        result.append(spot_data)

    return result

@router.get("/{spot_id}", response_model=StudySpotOut)
def get_study_spot(spot_id: int, db: Session = Depends(get_db)):
    spot = db.query(StudySpot).filter(StudySpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Study spot not found")
    return spot
