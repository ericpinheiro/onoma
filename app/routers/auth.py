import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Tenant, User
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.services.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    tenant = Tenant(name=body.tenant_name, email=body.email)
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        is_admin=True,
    )
    tenant.users.append(user)

    try:
        db.add(tenant)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado")

    return TokenResponse(
        access_token=create_access_token(str(user.id), str(user.tenant_id)),
        refresh_token=create_refresh_token(str(user.id), str(user.tenant_id)),
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email, User.is_active.is_(True)).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    return TokenResponse(
        access_token=create_access_token(str(user.id), str(user.tenant_id)),
        refresh_token=create_refresh_token(str(user.id), str(user.tenant_id)),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token, expected_type="refresh")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    user = db.query(User).filter(User.id == uuid.UUID(payload["sub"]), User.is_active.is_(True)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuário não encontrado")

    return TokenResponse(
        access_token=create_access_token(str(user.id), str(user.tenant_id)),
        refresh_token=create_refresh_token(str(user.id), str(user.tenant_id)),
    )
