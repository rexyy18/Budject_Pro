import uuid
from datetime import date, datetime

from sqlalchemy import String, Float, Date, DateTime, Text, Integer, text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def generate_uuid() -> str:
    return uuid.uuid4().hex


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    budgetDate: Mapped[date] = mapped_column(Date, nullable=False)
    effectiveDate: Mapped[date] = mapped_column(Date, nullable=False)
    createdAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), nullable=False
    )
    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"), nullable=False
    )


class Category(Base):
    __tablename__ = "categories"

    name: Mapped[str] = mapped_column(String, primary_key=True, index=True, nullable=False)


class Settings(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, default=1)
    defaultCurrency: Mapped[str] = mapped_column(String(3), nullable=False, default="GHS")
    theme: Mapped[str] = mapped_column(String, nullable=False, default="glass")


