from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .database import Base, engine
from .routers import budgets, categories, settings


def create_app() -> FastAPI:
    application = FastAPI(title="BudgetTrackr API", version="1.0.0")

    # CORS configuration (adjust as needed)
    origins = [
        "http://localhost",
        "http://localhost:3000",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
    ]

    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=".*",  # allow file:// (null) and any local tools
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Routers
    application.include_router(budgets.router)
    application.include_router(categories.router)
    application.include_router(settings.router)

    # Static frontend (serves index.html at /)
    frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
    application.mount("/", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

    @application.get("/api/health")
    def health_check():
        return {"status": "ok"}

    return application


app = create_app()


