from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas.tenant import TenantResponse, TenantUpdateRequest

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.get("/me", response_model=TenantResponse)
def get_my_tenant(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user.tenant


@router.patch("/me", response_model=TenantResponse)
def update_my_tenant(
    body: TenantUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tenant = current_user.tenant
    if body.name is not None:
        tenant.name = body.name
    db.commit()
    db.refresh(tenant)
    return tenant
