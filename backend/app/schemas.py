from datetime import date, datetime
from typing import Optional, Literal, List

from pydantic import BaseModel, ConfigDict


class BudgetBase(BaseModel):
	name: str
	amount: float
	currency: Literal["GHS", "USD", "EUR"]
	category: str
	description: Optional[str] = None
	budgetDate: date
	effectiveDate: date


class BudgetCreate(BudgetBase):
	pass


class BudgetUpdate(BudgetBase):
	pass


class BudgetOut(BudgetBase):
	id: str
	createdAt: datetime
	updatedAt: datetime

	model_config = ConfigDict(from_attributes=True)


class CategoryIn(BaseModel):
	name: str


class CategoryOut(BaseModel):
	name: str

	model_config = ConfigDict(from_attributes=True)


class SettingsOut(BaseModel):
	defaultCurrency: Literal["GHS", "USD", "EUR"] = "GHS"
	theme: Literal["glass", "light", "dark"] = "glass"

	model_config = ConfigDict(from_attributes=True)


class SettingsUpdate(BaseModel):
	defaultCurrency: Optional[Literal["GHS", "USD", "EUR"]] = None
	theme: Optional[Literal["glass", "light", "dark"]] = None


