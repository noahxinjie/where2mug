#TODO

# app/routes/v1/reviews_routes.py
# created using chatgpt
#. It assumes you’ll have app.models.review.Review and app.schemas.review.{ReviewCreate, ReviewOut} defined, and uses your existing StudySpot and User models to validate foreign keys.

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.db.session import get_db
from app.models.review import Review
from app.models.studyspot import StudySpot
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter()

@router.post("/", response_model=ReviewOut)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    # Ensure referenced StudySpot exists
    spot = db.query(StudySpot).filter(StudySpot.id == payload.studyspot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Study spot not found")

    # Ensure referenced User exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Optional: prevent duplicate review by same user for the same spot
    existing = db.query(Review).filter(
        and_(
            Review.studyspot_id == payload.studyspot_id,
            Review.user_id == payload.user_id
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already reviewed this study spot")

    new_review = Review(**payload.model_dump())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/", response_model=list[ReviewOut])
def list_reviews(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    return (
        db.query(Review)
        .order_by(Review.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.get("/by-spot/{spot_id}", response_model=list[ReviewOut])
def list_reviews_for_spot(
    spot_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    # 404 if spot doesn’t exist (optional but nice)
    if not db.query(StudySpot).filter(StudySpot.id == spot_id).first():
        raise HTTPException(status_code=404, detail="Study spot not found")

    return (
        db.query(Review)
        .where(Review.studyspot_id == spot_id)
        .order_by(Review.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.get("/by-user/{user_id}", response_model=list[ReviewOut])
def list_reviews_by_user(
    user_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    # 404 if user doesn’t exist (optional)
    if not db.query(User).filter(User.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    return (
        db.query(Review)
        .where(Review.user_id == user_id)
        .order_by(Review.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

@router.put("/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int = Path(..., ge=1),
    payload: ReviewCreate = None,  # reuse schema; or define a separate ReviewUpdate
    db: Session = Depends(get_db),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    # Optional: re-validate FK if IDs are allowed to change (usually they aren’t)
    if payload.studyspot_id != review.studyspot_id:
        if not db.query(StudySpot).filter(StudySpot.id == payload.studyspot_id).first():
            raise HTTPException(status_code=404, detail="Study spot not found")
    if payload.user_id != review.user_id:
        if not db.query(User).filter(User.id == payload.user_id).first():
            raise HTTPException(status_code=404, detail="User not found")

    for k, v in payload.model_dump().items():
        setattr(review, k, v)
    db.commit()
    db.refresh(review)
    return review

@router.delete("/{review_id}", status_code=204)
def delete_review(review_id: int = Path(..., ge=1), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    db.delete(review)
    db.commit()
    return None
