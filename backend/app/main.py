from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import budgets, categories, settings


def create_app() -> FastAPI:
	app = FastAPI(title="BudgetTrackr API", version="1.0.0")

	# CORS configuration (adjust as needed)
	origins = [
		"http://localhost",
		"http://localhost:3000",
		"http://127.0.0.1",
		"http://127.0.0.1:3000",
	]

	app.add_middleware(
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
	app.include_router(budgets.router)
	app.include_router(categories.router)
	app.include_router(settings.router)

	@app.get("/api/health")
	def health_check():
		return {"status": "ok"}

	return app


app = create_app()


