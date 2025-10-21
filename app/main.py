from fastapi import FastAPI
from app.routes.v1 import users_routes, studyspots_routes
from app.db.base import Base
from app.db.session import engine

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Where2Mug")

app.include_router(users_routes.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(studyspots_routes.router, prefix="/api/v1/studyspots", tags=["Study Spots"])
