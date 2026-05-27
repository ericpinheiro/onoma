import re
import uuid
from datetime import date, datetime

from pydantic import BaseModel, field_validator


def normalize_process_number(value: str) -> str:
    """Strip non-alphanumeric chars and uppercase for consistent matching."""
    return re.sub(r"[^A-Z0-9]", "", value.upper())


class TrademarkCreateRequest(BaseModel):
    process_number: str
    name: str | None = None

    @field_validator("process_number")
    @classmethod
    def validate_process_number(cls, v: str) -> str:
        normalized = normalize_process_number(v)
        if len(normalized) < 6:
            raise ValueError("Número de processo inválido")
        return normalized


class TrademarkResponse(BaseModel):
    id: uuid.UUID
    process_number: str
    name: str | None
    current_status: str | None
    current_status_description: str | None
    last_rpi_edition: int | None
    last_updated: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TrademarkStatusHistoryResponse(BaseModel):
    id: uuid.UUID
    status: str
    description: str | None
    rpi_edition: int
    published_at: date | None
    created_at: datetime

    model_config = {"from_attributes": True}


class RPIProcessingLogResponse(BaseModel):
    id: uuid.UUID
    edition_number: int
    url: str | None
    processed_at: datetime
    status: str
    trademarks_found: int
    trademarks_updated: int
    error_detail: str | None

    model_config = {"from_attributes": True}
