from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.v1 import users_routes, studyspots_routes, reviews_routes
from app.db.base import Base
from app.db.session import engine
from dotenv import load_dotenv
import os

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Where2Mug")


load_dotenv()
ENV = os.getenv("ENV", "DEV")

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
