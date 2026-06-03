# Spec: Pipeline de Processamento do RPI

## O que é o RPI

A Revista da Propriedade Industrial é publicada pelo INPI toda semana (geralmente terça-feira). Contém despachos sobre pedidos e registros de marcas. O Onoma baixa essa revista e atualiza o status de cada marca monitorada.

## Fluxo completo

```
APScheduler (toda terça, 10h UTC)
        │
        ▼
run_latest_rpi()                     ← ponto de entrada do scheduler
        │
        ├─ descobre próxima edição    ← get_latest_edition_number()
        ├─ verifica se já processada  ← consulta rpi_processing_logs
        │
        ▼
process_rpi_edition(edition, db)     ← também chamado pelos endpoints admin
        │
        ├─ cria RPIProcessingLog (status="failed" provisório)
        ├─ _download_rpi(url)         ← httpx, timeout 120s, follow_redirects
        ├─ _maybe_unzip(raw)          ← detecta ZIP pelo magic bytes "PK"
        ├─ parse_rpi_xml(xml_bytes)   ← lxml iterparse streaming
        ├─ build_lookup(entries)      ← dict[process_number → list[RPIEntry]]
        │
        ├─ para cada Trademark monitorado (todos os tenants):
        │       ├─ lookup.get(process_number)
        │       ├─ pega matches[-1]   ← último despacho da edição para esse processo
        │       ├─ verifica duplicata (mesmo trademark_id + edition + status)
        │       ├─ grava TrademarkStatusHistory
        │       └─ atualiza trademark.current_status + last_rpi_edition
        │
        ├─ log.status = "success"
        └─ db.commit()
```

## URL do arquivo

```
{RPI_BASE_URL}/RM{edition_number}.zip
```

Exemplo: `https://revistas.inpi.gov.br/txt/RM2742.zip`

O arquivo é um ZIP contendo um XML. O `_maybe_unzip` detecta ZIP pelo magic bytes `b"PK"` e extrai o primeiro `.xml` encontrado.

## Estrutura do XML

```xml
<revista numero="2742" data="18/03/2025">
  <despacho codigo="IPAS-0158" nome="Concessao de Registro">
    <processo numero="906596045" data-deposito="01/01/2020">
      <titular nome="EMPRESA ALFA LTDA" pais="BR"/>
      <marca nome="ALFA" apresentacao="Nominativa"/>
    </processo>
  </despacho>
  <despacho codigo="IPAS-0160" nome="Indeferimento">
    <processo numero="987654321">...</processo>
  </despacho>
</revista>
```

- `revista.numero` → número da edição
- `revista.data` → data de publicação (formato `DD/MM/YYYY`)
- `despacho.codigo` → código do status (ex: `IPAS-0158`)
- `despacho.nome` → descrição do status
- `processo.numero` → número do processo (normalizado antes de salvar)

## Normalização do número de processo

```python
re.sub(r"[^A-Z0-9]", "", value.upper())
```

Remove tudo que não for letra maiúscula ou dígito. Espaços, traços, pontos são eliminados. Aplicado tanto no cadastro da marca (schema) quanto no parser do RPI — garantindo que o `lookup.get(process_number)` funcione.

Exemplos:
- `"90 6596 045"` → `"906596045"`
- `"BR 50 2020 012345"` → `"BR502020012345"`

## Como `get_latest_edition_number` funciona

Não consulta o INPI. Lógica local:

1. Busca o maior `edition_number` em `rpi_processing_logs`
2. Se existe: retorna `last + 1` (próxima edição a processar)
3. Se não existe (banco vazio): usa `_estimate_current_edition()`

`_estimate_current_edition` calcula semanas desde 05/01/1971 (data base aproximada da edição 1), com piso em 2700:

```python
base_date = date(1971, 1, 5)
weeks_elapsed = (today - base_date).days // 7
return max(weeks_elapsed, 2700)
```

**Implicação**: o endpoint `GET /admin/rpi/latest-edition` retorna a **próxima a processar**, não a última publicada pelo INPI.

## Idempotência e deduplicação

Em dois níveis:

1. **Nível de log**: se `rpi_processing_logs` já tem aquela edição com `status="success"`, o endpoint admin retorna `409` e o scheduler pula. Passar `?force=true` deleta o log e reprocessa.

2. **Nível de histórico**: dentro de `process_rpi_edition`, antes de gravar `TrademarkStatusHistory`, verifica se já existe registro com mesmo `trademark_id + rpi_edition + status`. Evita duplicatas em reprocessamentos parciais.

## Comportamento em falha

Se qualquer exceção ocorre em `process_rpi_edition`:
- `log.status` permanece `"failed"`
- `log.error_detail` recebe `str(exc)`
- `db.commit()` ainda é chamado — o log de falha é persistido
- O scheduler não re-tenta automaticamente; a próxima tentativa ocorre na semana seguinte (ou via endpoint admin)

## Backfill

`POST /admin/rpi/backfill?n=N` processa as `N` edições anteriores à "latest" (inclusive). Máximo de 104 (2 anos). Para cada edição, mesma lógica de `process_rpi_edition` com suporte a `?force=true`.

O backfill é **síncrono** — a requisição HTTP só retorna após todas as edições serem processadas. Para N grande isso pode demorar vários minutos (download + parse de cada edição).

## Scheduler

- Tipo: APScheduler `BackgroundScheduler` (thread em background, não async)
- Iniciado no `lifespan` do FastAPI
- Cron: `day_of_week=RPI_SCHEDULE_DAY_OF_WEEK, hour=RPI_SCHEDULE_HOUR`
- **O scheduler é in-process**: se a instância da aplicação reiniciar, ele é recriado automaticamente no próximo `lifespan`. Não há persistência do estado do scheduler.
- Em Railway (single dyno), o restart limpa o scheduler, mas o próximo deploy ou boot o recria corretamente.
