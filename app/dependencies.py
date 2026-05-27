import uuid

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User
from app.services.auth import decode_token

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = decode_token(token, expected_type="access")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    user = db.query(User).filter(User.id == uuid.UUID(payload["sub"]), User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")
    return user


def require_super_admin(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> None:
    if credentials.credentials != settings.SUPER_ADMIN_TOKEN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
