import uuid

from sqlalchemy import Column, String, Float, Date, DateTime, Text, Integer
from sqlalchemy.sql import func

from .database import Base


def generate_uuid() -> str:
	return uuid.uuid4().hex


class Budget(Base):
	__tablename__ = "budgets"

	id = Column(String, primary_key=True, index=True, default=generate_uuid)
	name = Column(String, nullable=False)
	amount = Column(Float, nullable=False)
	currency = Column(String(3), nullable=False)
	category = Column(String, nullable=False)
	description = Column(Text, nullable=True)
	budgetDate = Column(Date, nullable=False)
	effectiveDate = Column(Date, nullable=False)
	createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
	updatedAt = Column(
		DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
	)


class Category(Base):
	__tablename__ = "categories"

	name = Column(String, primary_key=True, index=True, nullable=False)


class Settings(Base):
	__tablename__ = "settings"

	id = Column(Integer, primary_key=True, index=True, default=1)
	defaultCurrency = Column(String(3), nullable=False, default="GHS")
	theme = Column(String, nullable=False, default="glass")


