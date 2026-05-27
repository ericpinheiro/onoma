"""
Parser do XML da Revista da Propriedade Industrial (RPI) do INPI.

O INPI publica o RPI semanalmente. O XML de marcas segue a estrutura:

<revista numero="XXXX" data="DD/MM/YYYY">
  <despacho codigo="IPAS-XXXX" nome="...">
    <processo numero="XXXXXXXXX" ...>
      <titular nome="..." />
      <marca nome="..." />
      ...
    </processo>
  </despacho>
</revista>

O parser usa iterparse (streaming) para lidar com arquivos grandes (>100MB).
"""

import re
from dataclasses import dataclass
from datetime import date
from typing import Generator

from lxml import etree


@dataclass
class RPIEntry:
    process_number: str  # normalizado (somente alfanumérico, uppercase)
    process_number_raw: str
    status_code: str
    status_description: str
    published_at: date | None


def normalize(value: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", value.upper())


def _parse_date(raw: str | None) -> date | None:
    if not raw:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            from datetime import datetime
            return datetime.strptime(raw.strip(), fmt).date()
        except ValueError:
            continue
    return None


def parse_rpi_xml(xml_bytes: bytes) -> tuple[int, date | None, list[RPIEntry]]:
    """
    Faz o parse do XML do RPI e retorna (numero_edicao, data_publicacao, entries).
    Usa iterparse para baixo consumo de memória.
    """
    entries: list[RPIEntry] = []
    edition_number = 0
    published_at: date | None = None

    current_despacho_code = ""
    current_despacho_name = ""

    context = etree.iterparse(
        _bytes_to_file(xml_bytes),
        events=("start", "end"),
        recover=True,
    )

    for event, elem in context:
        tag = etree.QName(elem.tag).localname if "{" in elem.tag else elem.tag

        if event == "start" and tag == "revista":
            edition_number = int(elem.get("numero", 0))
            published_at = _parse_date(elem.get("data"))

        elif event == "start" and tag == "despacho":
            current_despacho_code = elem.get("codigo", "")
            current_despacho_name = elem.get("nome", "")

        elif event == "end" and tag == "processo":
            raw_number = elem.get("numero", "").strip()
            if raw_number:
                entries.append(
                    RPIEntry(
                        process_number=normalize(raw_number),
                        process_number_raw=raw_number,
                        status_code=current_despacho_code,
                        status_description=current_despacho_name,
                        published_at=published_at,
                    )
                )
            elem.clear()  # libera memória

    return edition_number, published_at, entries


def _bytes_to_file(data: bytes):
    import io
    return io.BytesIO(data)


def build_lookup(entries: list[RPIEntry]) -> dict[str, list[RPIEntry]]:
    """Indexa entries por process_number normalizado para busca O(1)."""
    index: dict[str, list[RPIEntry]] = {}
    for entry in entries:
        index.setdefault(entry.process_number, []).append(entry)
    return index
