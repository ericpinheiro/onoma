from datetime import date

from app.services.rpi_parser import build_lookup, normalize, parse_rpi_xml

SAMPLE_RPI_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<revista numero="2742" data="18/03/2025">
  <despacho codigo="IPAS-0158" nome="Concessao de Registro">
    <processo numero="906596045" data-deposito="01/01/2020">
      <titular nome="EMPRESA ALFA LTDA" pais="BR"/>
      <marca nome="ALFA" apresentacao="Nominativa"/>
    </processo>
    <processo numero="123456789">
      <titular nome="EMPRESA BETA SA" pais="BR"/>
      <marca nome="BETA"/>
    </processo>
  </despacho>
  <despacho codigo="IPAS-0160" nome="Indeferimento">
    <processo numero="987654321">
      <titular nome="EMPRESA GAMA EIRELI" pais="BR"/>
      <marca nome="GAMA"/>
    </processo>
  </despacho>
</revista>
"""


def test_parse_edition_number():
    edition, pub_date, entries = parse_rpi_xml(SAMPLE_RPI_XML)
    assert edition == 2742


def test_parse_published_date():
    _, pub_date, _ = parse_rpi_xml(SAMPLE_RPI_XML)
    assert pub_date == date(2025, 3, 18)


def test_parse_entries_count():
    _, _, entries = parse_rpi_xml(SAMPLE_RPI_XML)
    assert len(entries) == 3


def test_parse_entry_fields():
    _, _, entries = parse_rpi_xml(SAMPLE_RPI_XML)
    first = entries[0]
    assert first.process_number == "906596045"
    assert first.status_code == "IPAS-0158"
    assert "Concessao" in first.status_description


def test_normalize():
    assert normalize("90 6596 045") == "906596045"
    assert normalize("BR 50 2020 012345 6") == "BR502020012345 6".replace(" ", "")
    assert normalize("abc-123") == "ABC123"


def test_build_lookup():
    _, _, entries = parse_rpi_xml(SAMPLE_RPI_XML)
    lookup = build_lookup(entries)
    assert "906596045" in lookup
    assert "987654321" in lookup
    assert lookup["906596045"][0].status_code == "IPAS-0158"


def test_process_not_in_xml_returns_empty():
    _, _, entries = parse_rpi_xml(SAMPLE_RPI_XML)
    lookup = build_lookup(entries)
    assert lookup.get("000000000") is None
