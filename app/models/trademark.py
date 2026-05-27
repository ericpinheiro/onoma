import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Trademark(Base):
    __tablename__ = "trademarks"
    __table_args__ = (UniqueConstraint("tenant_id", "process_number", name="uq_trademark_per_tenant"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), nullable=False)
    process_number: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255))
    current_status: Mapped[str | None] = mapped_column(String(20))
    current_status_description: Mapped[str | None] = mapped_column(Text)
    last_rpi_edition: Mapped[int | None] = mapped_column(Integer)
    last_updated: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    tenant = relationship("Tenant", back_populates="trademarks")
    history = relationship(
        "TrademarkStatusHistory",
        back_populates="trademark",
        cascade="all, delete-orphan",
        order_by="TrademarkStatusHistory.rpi_edition.desc()",
    )


class TrademarkStatusHistory(Base):
    __tablename__ = "trademark_status_history"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    trademark_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("trademarks.id"), nullable=False)
    tenant_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("tenants.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    rpi_edition: Mapped[int] = mapped_column(Integer, nullable=False)
    published_at: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    trademark = relationship("Trademark", back_populates="history")


class RPIProcessingLog(Base):
    __tablename__ = "rpi_processing_logs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    edition_number: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    url: Mapped[str | None] = mapped_column(String(500))
    processed_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # success | failed | partial
    trademarks_found: Mapped[int] = mapped_column(Integer, default=0)
    trademarks_updated: Mapped[int] = mapped_column(Integer, default=0)
    error_detail: Mapped[str | None] = mapped_column(Text)
