from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_super_admin
from app.models import PLAN_LIMITS, RPIProcessingLog, Tenant
from app.schemas.tenant import TenantPlanUpdateRequest, TenantResponse
from app.schemas.trademark import RPIProcessingLogResponse
from app.services.rpi_processor import get_latest_edition_number, process_rpi_edition

import uuid

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_super_admin)])


@router.patch("/tenants/{tenant_id}/plan", response_model=TenantResponse)
def update_tenant_plan(
    tenant_id: uuid.UUID,
    body: TenantPlanUpdateRequest,
    db: Session = Depends(get_db),
):
    if body.plan not in PLAN_LIMITS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Plano inválido. Opções: {list(PLAN_LIMITS.keys())}",
        )
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant não encontrado")
    tenant.plan = body.plan
    db.commit()
    db.refresh(tenant)
    return tenant


@router.post("/rpi/process/{edition_number}", response_model=RPIProcessingLogResponse)
def trigger_rpi_processing(
    edition_number: int,
    force: bool = False,
    db: Session = Depends(get_db),
):
    already = db.query(RPIProcessingLog).filter(RPIProcessingLog.edition_number == edition_number).first()
    if already and already.status == "success" and not force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Edição {edition_number} já processada com sucesso. Use ?force=true para reprocessar.",
        )
    if already and force:
        db.delete(already)
        db.commit()
    log = process_rpi_edition(edition_number, db)
    return log


@router.get("/rpi/latest-edition")
def get_latest_edition(db: Session = Depends(get_db)):
    edition = get_latest_edition_number(db)
    return {"edition_number": edition}


@router.post("/rpi/process/latest", response_model=RPIProcessingLogResponse)
def trigger_latest_rpi(force: bool = False, db: Session = Depends(get_db)):
    edition = get_latest_edition_number(db)
    already = db.query(RPIProcessingLog).filter(RPIProcessingLog.edition_number == edition).first()
    if already and already.status == "success" and not force:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Edição {edition} já processada com sucesso. Use ?force=true para reprocessar.",
        )
    if already and force:
        db.delete(already)
        db.commit()
    return process_rpi_edition(edition, db)


@router.get("/rpi/logs", response_model=list[RPIProcessingLogResponse])
def list_rpi_logs(db: Session = Depends(get_db)):
    return (
        db.query(RPIProcessingLog)
        .order_by(RPIProcessingLog.edition_number.desc())
        .limit(50)
        .all()
    )
