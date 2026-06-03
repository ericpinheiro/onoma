def test_register_success(client):
    resp = client.post("/auth/register", json={
        "tenant_name": "Test Corp",
        "email": "user@test.com",
        "password": "pass1234",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client):
    payload = {"tenant_name": "T", "email": "dup@test.com", "password": "x"}
    client.post("/auth/register", json=payload)
    resp = client.post("/auth/register", json=payload)
    assert resp.status_code == 409


def test_login_success(client):
    client.post("/auth/register", json={
        "tenant_name": "T", "email": "u@test.com", "password": "senha123",
    })
    resp = client.post("/auth/login", json={"email": "u@test.com", "password": "senha123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/auth/register", json={
        "tenant_name": "T", "email": "u@test.com", "password": "senha123",
    })
    resp = client.post("/auth/login", json={"email": "u@test.com", "password": "errada"})
    assert resp.status_code == 401


def test_refresh_token(client):
    reg = client.post("/auth/register", json={
        "tenant_name": "T", "email": "u@test.com", "password": "senha123",
    })
    refresh_token = reg.json()["refresh_token"]
    resp = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_protected_endpoint_without_token(client):
    resp = client.get("/tenants/me")
    assert resp.status_code in (401, 403)
