from typing import Optional
import math

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.schemas.studyspot import StudySpotCreate, StudySpotOut
from app.models.studyspot import StudySpot
from app.models.review import Review
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



def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Returns distance in kilometers between two points
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


@router.get("/search", response_model=list[StudySpotOut])
def search_study_spots(
    lat: Optional[float] = Query(None, description="Latitude of user location"),
    lon: Optional[float] = Query(None, description="Longitude of user location"),
    radius_km: float = Query(1.0, description="Search radius in kilometers"),
    min_avg_rating: Optional[int] = Query(None, ge=1, le=5, description="Minimum average rating (1-5)"),
    db: Session = Depends(get_db),
):
    """Search study spots with optional location/radius filtering and optional minimum average rating."""
    # Build base query: study spots with aggregated average rating
    query = db.query(StudySpot, func.avg(Review.rating).label("avg_rating")).outerjoin(Review).group_by(StudySpot.id)

    # If lat/lon provided, first apply a bounding box to limit candidates
    candidates = []
    if lat is not None and lon is not None:
        # approximate degree deltas
        lat_delta = radius_km / 110.574
        lon_delta = radius_km / (111.320 * max(0.000001, math.cos(math.radians(lat))))
        query = query.filter(
            StudySpot.latitude >= lat - lat_delta,
            StudySpot.latitude <= lat + lat_delta,
            StudySpot.longitude >= lon - lon_delta,
            StudySpot.longitude <= lon + lon_delta,
        )

    results = query.all()

    out: list[dict] = []
    for spot, avg_rating in results:
        # compute accurate distance if location provided
        distance = None
        if lat is not None and lon is not None:
            distance = haversine_km(lat, lon, spot.latitude, spot.longitude)
            if distance is None:
                continue
            if distance > radius_km:
                continue

        avg = float(avg_rating) if avg_rating is not None else None
        if min_avg_rating is not None:
            # treat None avg as 0 (exclude) -- only include if avg exists and meets threshold
            if avg is None or avg < float(min_avg_rating):
                continue

        out.append({
            "id": spot.id,
            "name": spot.name,
            "place_id": spot.place_id,
            "latitude": spot.latitude,
            "longitude": spot.longitude,
            "status": spot.status,
            "description": spot.description,
            "avg_rating": avg,
            "distance_km": distance,
        })

    # sort by distance if location provided
    if lat is not None and lon is not None:
        out.sort(key=lambda s: (s["distance_km"] is None, s["distance_km"]))

    return out


@router.get("/{spot_id}", response_model=StudySpotOut)
def get_study_spot(spot_id: int, db: Session = Depends(get_db)):
    spot = db.query(StudySpot).filter(StudySpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Study spot not found")
    return spot
