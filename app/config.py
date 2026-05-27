from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24h
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    SUPER_ADMIN_TOKEN: str

    RPI_BASE_URL: str = "https://revistas.inpi.gov.br/txt"
    RPI_SCHEDULE_DAY_OF_WEEK: str = "tue"
    RPI_SCHEDULE_HOUR: int = 10

    model_config = {"env_file": ".env"}


settings = Settings()
