from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import admin, auth, tenants, trademarks
from app.services.rpi_processor import run_latest_rpi


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        run_latest_rpi,
        trigger="cron",
        day_of_week=settings.RPI_SCHEDULE_DAY_OF_WEEK,
        hour=settings.RPI_SCHEDULE_HOUR,
        id="rpi_weekly",
        replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="Onoma API",
    description="Multi-tenant API para monitoramento de marcas no INPI",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tenants.router)
app.include_router(trademarks.router)
app.include_router(admin.router)


@app.get("/health", tags=["infra"])
def health():
    return {"status": "ok"}
