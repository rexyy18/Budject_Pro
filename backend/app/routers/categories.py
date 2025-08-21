from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..deps import get_db


router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=List[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
	return crud.list_categories(db)


@router.post("", response_model=schemas.CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(payload: schemas.CategoryIn, db: Session = Depends(get_db)):
	return crud.create_category(db, payload.name)


@router.delete("/{name}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(name: str, db: Session = Depends(get_db)):
	success = crud.delete_category(db, name)
	if not success:
		raise HTTPException(status_code=404, detail="Category not found")
	return None


