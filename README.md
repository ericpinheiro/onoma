# Onoma

API multi-tenant para monitoramento de status de marcas registradas no INPI. Toda semana o INPI publica a **Revista da Propriedade Industrial (RPI)** em formato XML — o Onoma baixa, processa e atualiza automaticamente o status de cada marca monitorada, permitindo que clientes consultem o status sem precisar acessar o INPI diretamente.

## Sumário

- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Pré-requisitos](#pré-requisitos)
- [Rodando localmente](#rodando-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Migrations](#migrations)
- [Endpoints da API](#endpoints-da-api)
- [Planos e limites](#planos-e-limites)
- [Cron job do RPI](#cron-job-do-rpi)
- [Testes](#testes)
- [Deploy no Railway](#deploy-no-railway)

---

## Arquitetura

```
Clientes (HTTP + JWT Bearer)
        │
        ▼
┌─────────────── FastAPI ───────────────┐
│  /auth  /tenants  /trademarks  /admin │
└───────────────────┬───────────────────┘
                    │
            ┌───────▼────────┐
            │   PostgreSQL   │
            │  (multi-tenant │
            │  via tenant_id)│
            └───────▲────────┘
                    │
      ┌─────────────┘
      │  APScheduler (toda terça-feira)
      │  └─ Baixa RPI do INPI (ZIP/XML)
      │  └─ Parse com lxml iterparse (streaming)
      │  └─ Atualiza status das marcas monitoradas
```

### Isolamento multi-tenant

Todas as tabelas possuem coluna `tenant_id`. As queries sempre filtram por `tenant_id` do usuário autenticado — garantindo que cada cliente acesse apenas seus próprios dados.

---

## Stack

| Camada | Tecnologia |
|---|---|
| API | Python 3.11+ · FastAPI |
| ORM / Migrations | SQLAlchemy 2.0 · Alembic |
| Banco de dados | PostgreSQL |
| Autenticação | JWT (python-jose) · bcrypt |
| Parser RPI | lxml (iterparse streaming) |
| Scheduler | APScheduler |
| HTTP client | httpx |
| Testes | pytest · httpx TestClient |
| Hosting | Railway.app |

---

## Pré-requisitos

- Python 3.11+
- PostgreSQL (local ou Railway)
- `pip` ou `uv`

---

## Rodando localmente

### 1. Clone e configure o ambiente

```bash
git clone <repo-url>
cd onoma

python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -e ".[dev]"
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas configurações (veja [Variáveis de ambiente](#variáveis-de-ambiente)).

### 3. Suba o banco (com Docker, opcional)

```bash
docker run -d \
  --name onoma-db \
  -e POSTGRES_USER=onoma \
  -e POSTGRES_PASSWORD=onoma \
  -e POSTGRES_DB=onoma \
  -p 5432:5432 \
  postgres:16
```

Nesse caso, `DATABASE_URL=postgresql://onoma:onoma@localhost:5432/onoma`.

### 4. Rode as migrations

```bash
alembic upgrade head
```

### 5. Suba a API

```bash
uvicorn app.main:app --reload
```

A API estará disponível em `http://localhost:8000`.

Documentação interativa (Swagger): `http://localhost:8000/docs`

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | URL de conexão PostgreSQL. Ex: `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | Sim | String aleatória para assinar os JWTs (mín. 32 chars) |
| `SUPER_ADMIN_TOKEN` | Sim | Token Bearer para os endpoints `/admin/*` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Não | Expiração do access token (padrão: `1440` = 24h) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Não | Expiração do refresh token (padrão: `30`) |
| `RPI_BASE_URL` | Não | URL base dos arquivos do RPI (padrão: `https://revistas.inpi.gov.br/txt`) |
| `RPI_SCHEDULE_DAY_OF_WEEK` | Não | Dia da semana do cron (padrão: `tue`) |
| `RPI_SCHEDULE_HOUR` | Não | Hora do cron em UTC (padrão: `10`) |

Gere uma `SECRET_KEY` segura:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## Migrations

```bash
# Aplicar todas as migrations pendentes
alembic upgrade head

# Criar uma nova migration após alterar models
alembic revision --autogenerate -m "descrição da mudança"

# Reverter uma migration
alembic downgrade -1
```

---

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cria um novo tenant + usuário admin |
| `POST` | `/auth/login` | Autentica e retorna tokens |
| `POST` | `/auth/refresh` | Renova o access token via refresh token |

#### Registrar

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"tenant_name": "Meu Escritório", "email": "admin@escritorio.com", "password": "senha123"}'
```

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

#### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@escritorio.com", "password": "senha123"}'
```

---

### Tenant

Todos os endpoints abaixo requerem o header `Authorization: Bearer <access_token>`.

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/tenants/me` | Retorna dados do tenant autenticado |
| `PATCH` | `/tenants/me` | Atualiza o nome do tenant |

```bash
curl http://localhost:8000/tenants/me \
  -H "Authorization: Bearer <token>"
```

```json
{
  "id": "uuid",
  "name": "Meu Escritório",
  "email": "admin@escritorio.com",
  "plan": "free",
  "max_trademarks": 5,
  "is_active": true,
  "created_at": "2025-01-01T00:00:00"
}
```

---

### Marcas

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/trademarks` | Lista marcas monitoradas (paginado) |
| `POST` | `/trademarks` | Adiciona marca para monitorar |
| `GET` | `/trademarks/{id}` | Detalhe de uma marca |
| `DELETE` | `/trademarks/{id}` | Remove marca do monitoramento |
| `GET` | `/trademarks/{id}/history` | Histórico de despachos da marca |

#### Adicionar marca

```bash
curl -X POST http://localhost:8000/trademarks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"process_number": "906596045", "name": "Minha Marca"}'
```

O `process_number` é normalizado automaticamente (espaços e traços são removidos).

```json
{
  "id": "uuid",
  "process_number": "906596045",
  "name": "Minha Marca",
  "current_status": null,
  "current_status_description": null,
  "last_rpi_edition": null,
  "last_updated": null,
  "created_at": "2025-01-01T00:00:00"
}
```

#### Consultar status atual

```bash
curl http://localhost:8000/trademarks/<id> \
  -H "Authorization: Bearer <token>"
```

```json
{
  "id": "uuid",
  "process_number": "906596045",
  "name": "Minha Marca",
  "current_status": "IPAS-0158",
  "current_status_description": "Concessão de Registro",
  "last_rpi_edition": 2742,
  "last_updated": "2025-03-18T10:00:00",
  "created_at": "2025-01-01T00:00:00"
}
```

#### Histórico de despachos

```bash
curl "http://localhost:8000/trademarks/<id>/history?limit=10" \
  -H "Authorization: Bearer <token>"
```

```json
[
  {
    "id": "uuid",
    "status": "IPAS-0158",
    "description": "Concessão de Registro",
    "rpi_edition": 2742,
    "published_at": "2025-03-18",
    "created_at": "2025-03-18T10:00:00"
  }
]
```

**Parâmetros de paginação** (disponíveis em `GET /trademarks` e `GET /trademarks/{id}/history`):

| Parâmetro | Padrão | Máximo |
|---|---|---|
| `skip` | `0` | — |
| `limit` | `50` | `200` |

---

### Admin

Protegido pelo header `Authorization: Bearer <SUPER_ADMIN_TOKEN>`.

| Método | Endpoint | Descrição |
|---|---|---|
| `PATCH` | `/admin/tenants/{id}/plan` | Atualiza o plano de um tenant |
| `POST` | `/admin/rpi/process/{edition}` | Dispara o processamento de uma edição do RPI |
| `GET` | `/admin/rpi/logs` | Lista os últimos 50 logs de processamento |

#### Atualizar plano

```bash
curl -X PATCH http://localhost:8000/admin/tenants/<tenant-id>/plan \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"plan": "professional"}'
```

#### Disparar processamento manual do RPI

```bash
curl -X POST http://localhost:8000/admin/rpi/process/2742 \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"
```

---

## Planos e limites

| Plano | Marcas | Preço/mês | Preço/ano (÷12) |
|---|---|---|---|
| `free` | 5 | — | — |
| `starter` | 30 | R$ 89 | R$ 74 |
| `professional` | 150 | R$ 229 | R$ 191 |
| `business` | 600 | R$ 549 | R$ 457 |
| `enterprise` | ilimitado | sob consulta | sob consulta |

Ao atingir o limite do plano, a API retorna `402 Payment Required`. Upgrades de plano são feitos via endpoint admin.

---

## Cron job do RPI

O scheduler é iniciado automaticamente junto com a aplicação (via `lifespan` do FastAPI). Toda terça-feira no horário configurado em `RPI_SCHEDULE_HOUR`, ele:

1. Identifica a próxima edição do RPI a processar
2. Baixa o arquivo ZIP da edição do INPI
3. Extrai e faz o parse do XML com `lxml iterparse` (streaming — suporta arquivos >200MB)
4. Para cada marca monitorada encontrada no RPI, atualiza `current_status` e grava o histórico
5. Registra o resultado em `rpi_processing_logs`

Para processar uma edição manualmente (ex: backfill):

```bash
curl -X POST http://localhost:8000/admin/rpi/process/2742 \
  -H "Authorization: Bearer <SUPER_ADMIN_TOKEN>"
```

---

## Testes

```bash
# Rodar todos os testes
pytest

# Com cobertura
pytest --cov=app --cov-report=term-missing

# Apenas um arquivo
pytest tests/test_rpi_parser.py -v
```

Os testes usam SQLite em memória — não requerem PostgreSQL rodando.

---

## Deploy no Railway

### 1. Crie o projeto no Railway

```bash
railway login
railway init
```

### 2. Adicione um banco PostgreSQL

No dashboard do Railway: **New Service → Database → PostgreSQL**.

### 3. Configure as variáveis de ambiente

No Railway, vá em **Settings → Variables** e adicione:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=<string-aleatoria-segura>
SUPER_ADMIN_TOKEN=<token-seguro>
```

### 4. Deploy

```bash
railway up
```

O Railway detecta o `railway.toml` e usa o comando:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 5. Rode as migrations em produção

```bash
railway run alembic upgrade head
```

### Health check

```bash
curl https://<seu-dominio>.railway.app/health
# {"status": "ok"}
```
