# Onoma

Monorepo da plataforma Onoma — sistema multi-tenant para monitoramento de status de marcas registradas no INPI. Toda semana o INPI publica a **Revista da Propriedade Industrial (RPI)** em formato XML; o Onoma baixa, processa e atualiza automaticamente o status de cada marca monitorada.

```
onoma/
├── api/   # Back-end: FastAPI + PostgreSQL + APScheduler
└── ui/    # Front-end: Next.js 15
```

---

## Como rodar o projeto

### Back-end

```bash
cd api
source .venv/bin/activate
uvicorn app.main:app --reload
```

API disponível em **http://localhost:8000** · Swagger em **http://localhost:8000/docs**

### Front-end

```bash
cd ui
yarn dev
```

Front-end disponível em **http://localhost:3000**

---

## Setup inicial

### Back-end (`api/`)

Stack: Python 3.11+, FastAPI, SQLAlchemy 2.0, Alembic, PostgreSQL, APScheduler.

**Pré-requisitos:** Python 3.11+, PostgreSQL (local ou via Docker)

```bash
# 1. Entrar no diretório
cd api

# 2. Criar e ativar o ambiente virtual
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Instalar dependências
pip install -e ".[dev]"

# 4. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com DATABASE_URL, SECRET_KEY e SUPER_ADMIN_TOKEN

# 5. Subir o banco com Docker (opcional)
docker run -d \
  --name onoma-db \
  -e POSTGRES_USER=onoma \
  -e POSTGRES_PASSWORD=onoma \
  -e POSTGRES_DB=onoma \
  -p 5432:5432 \
  postgres:16

# 6. Rodar as migrations
alembic upgrade head
```

### Front-end (`ui/`)

Stack: Next.js 15, React 18, SWR, Axios, Sass.

**Pré-requisitos:** Node.js 18+, yarn

```bash
# 1. Entrar no diretório
cd ui

# 2. Instalar dependências
yarn install

# 3. Configurar variáveis de ambiente
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```
