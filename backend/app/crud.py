from typing import List, Optional

from sqlalchemy.orm import Session

from . import models, schemas


# Budgets
def list_budgets(db: Session) -> List[models.Budget]:
	return db.query(models.Budget).order_by(models.Budget.createdAt.desc()).all()


def get_budget(db: Session, budget_id: str) -> Optional[models.Budget]:
	return db.query(models.Budget).filter(models.Budget.id == budget_id).first()


def create_budget(db: Session, budget: schemas.BudgetCreate) -> models.Budget:
	entity = models.Budget(**budget.model_dump())
	db.add(entity)
	db.commit()
	db.refresh(entity)
	return entity


def update_budget(db: Session, budget_id: str, budget: schemas.BudgetUpdate) -> Optional[models.Budget]:
	entity = get_budget(db, budget_id)
	if not entity:
		return None
	for key, value in budget.model_dump().items():
		setattr(entity, key, value)
	db.commit()
	db.refresh(entity)
	return entity


def delete_budget(db: Session, budget_id: str) -> bool:
	entity = get_budget(db, budget_id)
	if not entity:
		return False
	db.delete(entity)
	db.commit()
	return True


# Categories
def list_categories(db: Session) -> List[models.Category]:
	return db.query(models.Category).order_by(models.Category.name.asc()).all()


def create_category(db: Session, name: str) -> models.Category:
	existing = db.query(models.Category).filter(models.Category.name == name).first()
	if existing:
		return existing
	entity = models.Category(name=name)
	db.add(entity)
	db.commit()
	db.refresh(entity)
	return entity


def delete_category(db: Session, name: str) -> bool:
	entity = db.query(models.Category).filter(models.Category.name == name).first()
	if not entity:
		return False
	db.delete(entity)
	db.commit()
	return True


# Settings
def get_settings(db: Session) -> models.Settings:
	settings = db.query(models.Settings).filter(models.Settings.id == 1).first()
	if not settings:
		settings = models.Settings(id=1, defaultCurrency="GHS", theme="glass")
		db.add(settings)
		db.commit()
		db.refresh(settings)
	return settings


def update_settings(db: Session, update: schemas.SettingsUpdate) -> models.Settings:
	settings = get_settings(db)
	if update.defaultCurrency is not None:
		settings.defaultCurrency = update.defaultCurrency
	if update.theme is not None:
		settings.theme = update.theme
	db.commit()
	db.refresh(settings)
	return settings


