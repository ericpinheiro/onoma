def test_create_trademark(registered_client):
    resp = registered_client.post("/trademarks", json={"process_number": "906596045"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["process_number"] == "906596045"
    assert data["current_status"] is None


def test_create_trademark_normalizes_process_number(registered_client):
    resp = registered_client.post("/trademarks", json={"process_number": "90 6596 045"})
    assert resp.status_code == 201
    assert resp.json()["process_number"] == "906596045"


def test_create_duplicate_trademark(registered_client):
    registered_client.post("/trademarks", json={"process_number": "123456789"})
    resp = registered_client.post("/trademarks", json={"process_number": "123456789"})
    assert resp.status_code == 409


def test_list_trademarks(registered_client):
    registered_client.post("/trademarks", json={"process_number": "111111111"})
    registered_client.post("/trademarks", json={"process_number": "222222222"})
    resp = registered_client.get("/trademarks")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_delete_trademark(registered_client):
    created = registered_client.post("/trademarks", json={"process_number": "999888777"})
    tid = created.json()["id"]
    resp = registered_client.delete(f"/trademarks/{tid}")
    assert resp.status_code == 204

    resp = registered_client.get(f"/trademarks/{tid}")
    assert resp.status_code == 404


def test_trademark_history_empty(registered_client):
    created = registered_client.post("/trademarks", json={"process_number": "555444333"})
    tid = created.json()["id"]
    resp = registered_client.get(f"/trademarks/{tid}/history")
    assert resp.status_code == 200
    assert resp.json() == []


def test_tenant_isolation(client):
    client.post("/auth/register", json={"tenant_name": "A", "email": "a@a.com", "password": "aaa"})
    login_b = client.post("/auth/register", json={"tenant_name": "B", "email": "b@b.com", "password": "bbb"})

    token_a = client.post("/auth/login", json={"email": "a@a.com", "password": "aaa"}).json()["access_token"]
    token_b = login_b.json()["access_token"]

    client.headers["Authorization"] = f"Bearer {token_a}"
    created = client.post("/trademarks", json={"process_number": "BRANDATENANT"})
    tid = created.json()["id"]

    client.headers["Authorization"] = f"Bearer {token_b}"
    resp = client.get(f"/trademarks/{tid}")
    assert resp.status_code == 404
