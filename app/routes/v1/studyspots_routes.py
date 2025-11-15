from typing import Optional
import math
import os
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
import boto3
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.schemas.studyspot import StudySpotCreate, StudySpotOut, PhotoOut
from app.models.studyspot import StudySpot
from app.models.review import Review
from app.models.checkin import Checkin
from app.db.session import get_db
from sqlalchemy import func
from app.models.photo import Photo

router = APIRouter()

logger = logging.getLogger(__name__)


# Simple cached S3 client
_s3_client = None
def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            region_name=os.getenv("AWS_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
    return _s3_client


def presigned_get_url(key: str, expires_in: int = 3600) -> str:
    """Generate a presigned GET URL for an S3 object key."""
    bucket = os.getenv("AWS_S3_BUCKET")
    if not bucket:
        return f"https://{bucket}.s3.amazonaws.com/{key}" if bucket else ""
    s3 = get_s3_client()
    try:
        return s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expires_in,
        )
    except Exception:
        # Fallback to public URL if presign fails
        return f"https://{bucket}.s3.amazonaws.com/{key}"


class PresignRequest(BaseModel):
    filename: str
    content_type: str


class PhotoNotify(BaseModel):
    key: str
    url: str
    is_primary: bool = False


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
            .filter(Checkin.studyspot_id == spot.id, Checkin.checkout_timestamp.is_(None))
            .scalar()
        )
        spot_data = StudySpotOut.from_orm(spot)
        spot_data.active_checkins = active_count
        # attach photos with presigned urls (newest first)
        photos = db.query(Photo).filter(Photo.studyspot_id == spot.id).order_by(Photo.created_at.desc(), Photo.is_primary.desc()).all()
        photos_out = [PhotoOut.from_orm(p) for p in photos]
        # replace stored url with presigned GET url (PhotoOut.from_orm uses DB values; override url)
        for photo_model in photos_out:
            # find corresponding Photo DB object to get key
            # We assume the DB Photo has same id ordering; fetch key via DB query
            db_photo = next((x for x in photos if x.id == photo_model.id), None)
            if db_photo:
                photo_model.url = presigned_get_url(db_photo.key)
        spot_data.photos = photos_out or None
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
    min_active_checkins: Optional[int] = Query(None, description="Minimum number of active check-ins (e.g. 10,20,50)"),
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
        # compute active checkins for this spot
        try:
            active_count = (
                db.query(func.count(Checkin.checkin_id))
                .filter(Checkin.studyspot_id == spot.id, Checkin.checkout_timestamp.is_(None))
                .scalar()
            )
        except Exception:
            active_count = 0
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

        if min_active_checkins is not None:
            # exclude spots with fewer active checkins than requested
            if (active_count or 0) < int(min_active_checkins):
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
            "active_checkins": int(active_count or 0),
            # include photos (primary first)
            "photos": [
                (lambda ph: (setattr(ph, 'url', presigned_get_url(ph.key)) or ph))(
                    PhotoOut.from_orm(p)
                )
                for p in db.query(Photo).filter(Photo.studyspot_id == spot.id).order_by(Photo.is_primary.desc(), Photo.created_at.desc()).all()
            ],
        })

    # sort by distance if location provided
    if lat is not None and lon is not None:
        out.sort(key=lambda s: (s["distance_km"] is None, s["distance_km"]))

    return out


@router.post("/{spot_id}/photos/presign")
def presign_photo_upload(spot_id: int, req: PresignRequest, db: Session = Depends(get_db)):
    # Validate spot exists
    spot = db.query(StudySpot).filter(StudySpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Study spot not found")

    bucket = os.getenv("AWS_S3_BUCKET")
    region = os.getenv("AWS_REGION")
    if not bucket:
        raise HTTPException(status_code=500, detail="S3 bucket not configured")
    

    # Validate bucket and AWS credentials exist
    if not bucket:
        logger.error("S3 bucket not configured (AWS_S3_BUCKET missing)")
        raise HTTPException(status_code=500, detail="S3 bucket not configured on server")
    

    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    if not access_key or not secret_key:
        logger.error("AWS credentials missing: AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY not set")
        raise HTTPException(status_code=500, detail="AWS credentials are not configured on server")

    key = f"studyspots/{spot_id}/{uuid.uuid4().hex}_{req.filename}"

    try:
        s3 = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )
    except Exception as e:
        print("[EXCEPTION] Failed to create S3 client:", repr(e), flush=True)
        logger.exception("Failed to create S3 client")
        raise HTTPException(status_code=500, detail=f"Failed to initialize S3 client: {str(e)}")

    try:
        presigned_post = s3.generate_presigned_post(
            Bucket=bucket,
            Key=key,
            #Fields={"Content-Type": req.content_type},
            Conditions=[["content-length-range", 1, 5 * 1024 * 1024]],
            ExpiresIn=300,
        )
        import json
        print(json.dumps(presigned_post, indent=2))
    except Exception as e:
        print(f"[EXCEPTION] Failed to generate presigned POST for key {key}: {repr(e)}", flush=True)
        logger.exception("Failed to generate presigned POST for key %s", key)
        # return a non-sensitive error to client while including error message for debugging
        raise HTTPException(status_code=500, detail=f"Failed to generate presigned upload data: {str(e)}")

    print(f"[DEBUG] presigned POST generated for key={key}", flush=True)
    return {"presigned": presigned_post, "key": key, "url": f"https://{bucket}.s3.amazonaws.com/{key}"}


@router.post("/{spot_id}/photos")
def notify_photo_saved(spot_id: int, payload: PhotoNotify, db: Session = Depends(get_db)):
    # Validate spot
    spot = db.query(StudySpot).filter(StudySpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Study spot not found")

    new_photo = Photo(studyspot_id=spot_id, url=payload.url, key=payload.key, is_primary=payload.is_primary)
    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    # If marked primary, unset other primary photos
    if payload.is_primary:
        try:
            db.query(Photo).filter(Photo.studyspot_id == spot_id, Photo.id != new_photo.id).update({Photo.is_primary: False})
            db.commit()
        except Exception:
            db.rollback()

    return {"id": new_photo.id, "url": new_photo.url, "key": new_photo.key, "is_primary": new_photo.is_primary}


@router.get("/{spot_id}", response_model=StudySpotOut)
def get_study_spot(spot_id: int, db: Session = Depends(get_db)):
    spot = db.query(StudySpot).filter(StudySpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Study spot not found")
    spot_out = StudySpotOut.from_orm(spot)
    # attach photos with presigned urls
    photos = db.query(Photo).filter(Photo.studyspot_id == spot.id).order_by(Photo.is_primary.desc(), Photo.created_at.desc()).all()
    photos_out = [PhotoOut.from_orm(p) for p in photos]
    for photo_model in photos_out:
        db_photo = next((x for x in photos if x.id == photo_model.id), None)
        if db_photo:
            photo_model.url = presigned_get_url(db_photo.key)
    spot_out.photos = photos_out or None
    return spot_out
