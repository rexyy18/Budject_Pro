from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


SQLALCHEMY_DATABASE_URL = "sqlite:///./backend/budgettrackr.db"

# Needed for SQLite when used with multiple threads (FastAPI default)
engine = create_engine(
	SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
	autocommit=False,
	autoflush=False,
	bind=engine,
	expire_on_commit=False,
)

Base = declarative_base()


