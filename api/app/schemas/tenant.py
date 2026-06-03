import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class TenantResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    plan: str
    max_trademarks: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TenantUpdateRequest(BaseModel):
    name: str | None = None


class TenantPlanUpdateRequest(BaseModel):
    plan: str
