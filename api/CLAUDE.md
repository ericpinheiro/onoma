# Onoma API — contexto de manutenção

API multi-tenant para monitoramento de marcas no INPI. Toda terça-feira o scheduler baixa a Revista da Propriedade Industrial (RPI) do INPI, faz parse do XML e atualiza o status de cada marca monitorada pelos clientes.

## Estrutura de arquivos

```
api/
├── app/
│   ├── main.py              # Entrypoint FastAPI + lifespan (inicia APScheduler)
│   ├── config.py            # Settings via pydantic-settings + .env
│   ├── database.py          # Engine SQLAlchemy + get_db dependency
│   ├── dependencies.py      # get_current_user / require_super_admin
│   ├── models/
│   │   ├── tenant.py        # Tenant + PLAN_LIMITS
│   │   ├── user.py          # User
│   │   └── trademark.py     # Trademark + TrademarkStatusHistory + RPIProcessingLog
│   ├── schemas/             # Pydantic request/response models
│   ├── routers/
│   │   ├── auth.py          # POST /auth/{register,login,refresh}
│   │   ├── tenants.py       # GET/PATCH /tenants/me
│   │   ├── trademarks.py    # CRUD /trademarks + /history
│   │   └── admin.py         # /admin/* (SUPER_ADMIN_TOKEN)
│   └── services/
│       ├── auth.py          # JWT encode/decode + bcrypt
│       ├── rpi_parser.py    # Parse XML do RPI (iterparse streaming)
│       └── rpi_processor.py # Download + parse + persistência do RPI
├── alembic/                 # Migrations
├── tests/
│   ├── conftest.py          # Fixtures: client, registered_client, db (SQLite)
│   ├── test_auth.py
│   ├── test_trademarks.py
│   └── test_rpi_parser.py
└── docs/
    ├── specs/               # Specs de manutenção detalhadas
    └── bruno/               # Coleção Bruno para teste manual
```

## Como rodar

```bash
cd api
source .venv/bin/activate
pip install -e ".[dev]"          # instala deps + dev
cp .env.example .env             # preencher DATABASE_URL, SECRET_KEY, SUPER_ADMIN_TOKEN
alembic upgrade head
uvicorn app.main:app --reload    # http://localhost:8000  |  /docs = Swagger
```

```bash
pytest                           # usa SQLite, não precisa de PostgreSQL
pytest --cov=app --cov-report=term-missing
```

## Autenticação — dois níveis

| Tipo | Como funciona |
|---|---|
| Usuário | JWT Bearer (access 24h + refresh 30d). Embutido em `get_current_user`. |
| Admin | Token Bearer estático (`SUPER_ADMIN_TOKEN` do `.env`). Verificado em `require_super_admin`. |

O admin **não é um usuário do banco** — é uma variável de ambiente. Endpoints `/admin/*` são para operações de plataforma (trocar plano de tenant, disparar/backfill RPI).

## Multi-tenancy

Row-level: todas as tabelas têm `tenant_id`. `get_current_user` extrai o `tenant_id` do JWT. Toda query de negócio filtra por esse `tenant_id`. **Nenhuma query retorna dados de outro tenant** — o teste `test_tenant_isolation` cobre isso.

Exceção intencional: `process_rpi_edition` em `rpi_processor.py` faz `db.query(Trademark).all()` sem filtro de tenant porque o RPI é um dado global do INPI — todos os tenants compartilham a mesma edição.

## Pipeline RPI

Ver `docs/specs/rpi-pipeline.md` para o fluxo completo e edge cases.

## Regras de negócio e planos

Ver `docs/specs/business-rules.md` para limites de plano, enforcement, e invariantes.

## Variáveis de ambiente

| Variável | Obrigatória | Padrão |
|---|---|---|
| `DATABASE_URL` | Sim | — |
| `SECRET_KEY` | Sim | — |
| `SUPER_ADMIN_TOKEN` | Sim | — |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Não | `1440` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Não | `30` |
| `RPI_BASE_URL` | Não | `https://revistas.inpi.gov.br/txt` |
| `RPI_SCHEDULE_DAY_OF_WEEK` | Não | `tue` |
| `RPI_SCHEDULE_HOUR` | Não | `10` |

## Migrations

```bash
alembic revision --autogenerate -m "descrição"   # após alterar models
alembic upgrade head
alembic downgrade -1
```

## Deploy (Railway)

```bash
railway run alembic upgrade head   # rodar migrations em produção
railway up                         # deploy
```

O `railway.toml` + `Procfile` apontam para `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
