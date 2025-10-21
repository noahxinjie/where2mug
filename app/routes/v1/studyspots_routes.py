from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.studyspot import StudySpotCreate, StudySpotOut
from app.models.studyspot import StudySpot
from app.db.session import get_db

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
    return db.query(StudySpot).all()
