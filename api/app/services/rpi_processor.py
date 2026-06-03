"""
Responsável por orquestrar o download, parse e persistência do RPI.
Também expõe a função usada pelo scheduler semanal.
"""

import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import RPIProcessingLog, Trademark, TrademarkStatusHistory
from app.services.rpi_parser import build_lookup, parse_rpi_xml

logger = logging.getLogger(__name__)


def _build_rpi_url(edition_number: int) -> str:
    return f"{settings.RPI_BASE_URL}/RM{edition_number}.zip"


def _download_rpi(url: str) -> bytes:
    with httpx.Client(timeout=120, follow_redirects=True) as client:
        response = client.get(url)
        response.raise_for_status()
        return response.content


def _maybe_unzip(data: bytes) -> bytes:
    """Se o conteúdo for um ZIP, extrai o primeiro arquivo XML encontrado."""
    if not data[:2] == b"PK":
        return data

    import io
    import zipfile

    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        xml_names = [n for n in zf.namelist() if n.lower().endswith(".xml")]
        if not xml_names:
            raise ValueError("ZIP não contém arquivo XML")
        return zf.read(xml_names[0])


def process_rpi_edition(edition_number: int, db: Session) -> RPIProcessingLog:
    url = _build_rpi_url(edition_number)
    log = RPIProcessingLog(
        edition_number=edition_number,
        url=url,
        status="failed",
    )
    db.add(log)
    db.flush()

    try:
        logger.info("Baixando RPI edição %d de %s", edition_number, url)
        raw = _download_rpi(url)
        xml_bytes = _maybe_unzip(raw)

        parsed_edition, published_at, entries = parse_rpi_xml(xml_bytes)
        lookup = build_lookup(entries)
        log.trademarks_found = len(entries)

        logger.info("RPI %d: %d entradas encontradas", edition_number, len(entries))

        monitored = db.query(Trademark).all()
        updated = 0

        for trademark in monitored:
            matches = lookup.get(trademark.process_number)
            if not matches:
                continue

            latest = matches[-1]  # pega o último despacho da edição para este processo
            already_recorded = (
                db.query(TrademarkStatusHistory)
                .filter(
                    TrademarkStatusHistory.trademark_id == trademark.id,
                    TrademarkStatusHistory.rpi_edition == edition_number,
                    TrademarkStatusHistory.status == latest.status_code,
                )
                .first()
            )
            if already_recorded:
                continue

            history = TrademarkStatusHistory(
                trademark_id=trademark.id,
                tenant_id=trademark.tenant_id,
                status=latest.status_code,
                description=latest.status_description,
                rpi_edition=edition_number,
                published_at=latest.published_at,
            )
            db.add(history)

            trademark.current_status = latest.status_code
            trademark.current_status_description = latest.status_description
            trademark.last_rpi_edition = edition_number
            trademark.last_updated = datetime.now(timezone.utc)
            updated += 1

        log.trademarks_updated = updated
        log.status = "success"
        logger.info("RPI %d: %d marcas atualizadas", edition_number, updated)

    except Exception as exc:
        log.status = "failed"
        log.error_detail = str(exc)
        logger.exception("Falha ao processar RPI edição %d: %s", edition_number, exc)

    db.commit()
    db.refresh(log)
    return log


def run_latest_rpi():
    """Ponto de entrada do scheduler: descobre e processa a edição mais recente."""
    db: Session = SessionLocal()
    try:
        last_log = db.query(RPIProcessingLog).order_by(RPIProcessingLog.edition_number.desc()).first()
        next_edition = (last_log.edition_number + 1) if last_log else _estimate_current_edition()

        already = db.query(RPIProcessingLog).filter(
            RPIProcessingLog.edition_number == next_edition,
            RPIProcessingLog.status == "success",
        ).first()
        if already:
            logger.info("Edição %d já processada, pulando", next_edition)
            return

        process_rpi_edition(next_edition, db)
    finally:
        db.close()


def get_latest_edition_number(db: Session) -> int:
    """Retorna a edição mais recente: a última processada + 1, ou a estimativa pela data."""
    last_log = db.query(RPIProcessingLog).order_by(RPIProcessingLog.edition_number.desc()).first()
    return (last_log.edition_number + 1) if last_log else _estimate_current_edition()


def _estimate_current_edition() -> int:
    """
    Estima o número da edição atual com base na data.
    O RPI é publicado semanalmente desde 1971. A edição 1 foi em 01/01/1971.
    """
    from datetime import date

    base_date = date(1971, 1, 5)  # terça-feira da primeira edição (aproximado)
    today = date.today()
    weeks_elapsed = (today - base_date).days // 7
    return max(weeks_elapsed, 2700)  # piso conservador
