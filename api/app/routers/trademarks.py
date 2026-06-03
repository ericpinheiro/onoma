import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Trademark, TrademarkStatusHistory, User
from app.schemas.trademark import (
    TrademarkCreateRequest,
    TrademarkResponse,
    TrademarkStatusHistoryResponse,
)

router = APIRouter(prefix="/trademarks", tags=["trademarks"])


def _get_trademark_or_404(trademark_id: uuid.UUID, tenant_id: uuid.UUID, db: Session) -> Trademark:
    trademark = (
        db.query(Trademark)
        .filter(Trademark.id == trademark_id, Trademark.tenant_id == tenant_id)
        .first()
    )
    if not trademark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Marca não encontrada")
    return trademark


@router.get("", response_model=list[TrademarkResponse])
def list_trademarks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Trademark)
        .filter(Trademark.tenant_id == current_user.tenant_id)
        .order_by(Trademark.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=TrademarkResponse, status_code=status.HTTP_201_CREATED)
def create_trademark(
    body: TrademarkCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tenant = current_user.tenant
    max_marks = tenant.max_trademarks
    if max_marks != -1:
        current_count = db.query(Trademark).filter(Trademark.tenant_id == tenant.id).count()
        if current_count >= max_marks:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Limite de {max_marks} marcas atingido para o plano '{tenant.plan}'",
            )

    trademark = Trademark(
        tenant_id=tenant.id,
        process_number=body.process_number,
        name=body.name,
    )
    try:
        db.add(trademark)
        db.commit()
        db.refresh(trademark)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Número de processo já monitorado",
        )
    return trademark


@router.get("/{trademark_id}", response_model=TrademarkResponse)
def get_trademark(
    trademark_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_trademark_or_404(trademark_id, current_user.tenant_id, db)


@router.delete("/{trademark_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trademark(
    trademark_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    trademark = _get_trademark_or_404(trademark_id, current_user.tenant_id, db)
    db.delete(trademark)
    db.commit()


@router.get("/{trademark_id}/history", response_model=list[TrademarkStatusHistoryResponse])
def get_trademark_history(
    trademark_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_trademark_or_404(trademark_id, current_user.tenant_id, db)
    return (
        db.query(TrademarkStatusHistory)
        .filter(
            TrademarkStatusHistory.trademark_id == trademark_id,
            TrademarkStatusHistory.tenant_id == current_user.tenant_id,
        )
        .order_by(TrademarkStatusHistory.rpi_edition.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
