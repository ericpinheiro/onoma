import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

PLAN_LIMITS: dict[str, int] = {
    "free": 5,
    "starter": 30,
    "professional": 150,
    "business": 600,
    "enterprise": -1,  # unlimited
}


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    plan: Mapped[str] = mapped_column(String(50), nullable=False, default="free")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    trademarks = relationship("Trademark", back_populates="tenant", cascade="all, delete-orphan")

    @property
    def max_trademarks(self) -> int:
        return PLAN_LIMITS.get(self.plan, 5)
