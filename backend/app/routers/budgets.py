from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..deps import get_db


router = APIRouter(prefix="/api/budgets", tags=["budgets"])


@router.get("", response_model=List[schemas.BudgetOut])
def list_budgets(db: Session = Depends(get_db)):
	return crud.list_budgets(db)


@router.post("", response_model=schemas.BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(payload: schemas.BudgetCreate, db: Session = Depends(get_db)):
	return crud.create_budget(db, payload)


@router.put("/{budget_id}", response_model=schemas.BudgetOut)
def update_budget(budget_id: str, payload: schemas.BudgetUpdate, db: Session = Depends(get_db)):
	entity = crud.update_budget(db, budget_id, payload)
	if not entity:
		raise HTTPException(status_code=404, detail="Budget not found")
	return entity


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: str, db: Session = Depends(get_db)):
	success = crud.delete_budget(db, budget_id)
	if not success:
		raise HTTPException(status_code=404, detail="Budget not found")
	return None


