from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.v1 import users_routes, studyspots_routes, reviews_routes, checkin_routes
from app.db.base import Base
from app.db.session import engine
from dotenv import load_dotenv
from pathlib import Path

import os
import logging

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Where2Mug", debug=True)

#load_dotenv()

BASE_DIR = Path(__file__).resolve().parent  # this is where main.py lives
dotenv_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=dotenv_path)

ENV = os.getenv("ENV", "DEV")

logging.basicConfig(level=logging.INFO)
logging.getLogger("uvicorn.error").propagate = True

if ENV == "DEV":
    # Local dev — frontend runs separately on own localhost ports
    allow_origins = [
        "http://localhost:3000",
        "http://localhost:3002",
    ]
else:
    # Production — frontend + backend served through Nginx on same origin
    allow_origins = ["*"]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all HTTP methods
    allow_headers=["*"], # Allow all headers
)

# Include API routers
app.include_router(users_routes.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(
    studyspots_routes.router, prefix="/api/v1/studyspots", tags=["Study Spots"]
)
app.include_router(reviews_routes.router, prefix="/api/v1/reviews", tags=["Reviews"])
app.include_router(checkin_routes.router, prefix="/api/v1/checkin", tags=["Checkin"])
