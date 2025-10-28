from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.v1 import users_routes, studyspots_routes, reviews_routes
from app.db.base import Base
from app.db.session import engine

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Where2Mug")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3002",
        "http://localhost:3000",
    ],  # React dev server ports
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(users_routes.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(
    studyspots_routes.router, prefix="/api/v1/studyspots", tags=["Study Spots"]
)
app.include_router(reviews_routes.router, prefix="/api/v1/reviews", tags=["Reviews"])
