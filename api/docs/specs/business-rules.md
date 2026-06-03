# Spec: Regras de Negócio

## Planos e limites de marcas

| Plano | Limite | Preço/mês |
|---|---|---|
| `free` | 5 | — |
| `starter` | 30 | R$ 89 |
| `professional` | 150 | R$ 229 |
| `business` | 600 | R$ 549 |
| `enterprise` | ilimitado (`-1`) | sob consulta |

Fonte autoritativa: `PLAN_LIMITS` em `app/models/tenant.py`. O `Tenant.max_trademarks` usa esse dict.

### Enforcement

`POST /trademarks` verifica o limite **antes** de inserir:

```python
if max_marks != -1:
    current_count = db.query(Trademark).filter(...).count()
    if current_count >= max_marks:
        raise HTTPException(402, ...)
```

- Retorna `402 Payment Required` quando o limite é atingido.
- `enterprise` (`-1`) nunca dispara a verificação.
- Upgrade de plano é feito exclusivamente via `PATCH /admin/tenants/{id}/plan`.

## Isolamento de tenant

Toda tabela de negócio tem `tenant_id`. A coluna não é opcional — é `NOT NULL` e tem FK para `tenants.id`.

Fluxo de autenticação → isolamento:
1. JWT carrega `{"sub": user_id, "tenant_id": tenant_id, "type": "access"}`
2. `get_current_user` decodifica o token e carrega o `User` do banco
3. Routers usam `current_user.tenant_id` para filtrar queries

**Onde o filtro NÃO se aplica:**

`process_rpi_edition` (em `rpi_processor.py`) busca `Trademark.all()` sem filtro de tenant. Isso é correto — o RPI é um dado global do INPI, não por tenant. Um mesmo número de processo pode ser monitorado por múltiplos tenants e todos recebem a atualização.

## Autenticação de usuário

- Algoritmo: `HS256` (configurável via `ALGORITHM`)
- Access token: expira em `ACCESS_TOKEN_EXPIRE_MINUTES` (padrão 1440 = 24h)
- Refresh token: expira em `REFRESH_TOKEN_EXPIRE_DAYS` (padrão 30 dias)
- O campo `type` no payload (`"access"` vs `"refresh"`) é validado explicitamente — evita uso de refresh token como access.
- Senhas: bcrypt (via `bcrypt.hashpw`)
- Refresh tokens **não são revogáveis** (não há blacklist). Para invalidar, trocar `SECRET_KEY`.

## Autenticação admin

Os endpoints `/admin/*` usam `require_super_admin`, que verifica:

```python
if credentials.credentials != settings.SUPER_ADMIN_TOKEN:
    raise HTTPException(403, "Acesso negado")
```

- Token é uma string fixa definida na variável de ambiente `SUPER_ADMIN_TOKEN`.
- Não é um usuário do banco — não tem `tenant_id` nem aparece em `users`.
- Não tem expiração — válido enquanto o env var não mudar.

## Registro de novo tenant

`POST /auth/register` cria atomicamente:
1. Um `Tenant` (plano `free`, `is_active=True`)
2. Um `User` com `is_admin=True`, vinculado ao tenant

O `email` do tenant e do primeiro usuário são o mesmo. `email` é unique tanto em `tenants` quanto em `users` — um segundo registro com o mesmo e-mail retorna `409`.

## Número de processo (trademark)

- Normalizado na entrada: `re.sub(r"[^A-Z0-9]", "", value.upper())`
- Validação mínima: resultado normalizado deve ter ≥ 6 caracteres
- Unique constraint: `(tenant_id, process_number)` — um tenant não pode monitorar o mesmo processo duas vezes; retorna `409`
- Dois tenants diferentes podem monitorar o mesmo número de processo

## Paginação

Endpoints que retornam listas aceitam `?skip=0&limit=50`:

| Parâmetro | Padrão | Máximo |
|---|---|---|
| `skip` | `0` | sem limite |
| `limit` | `50` | `200` |

## Invariantes que os testes cobrem

| Invariante | Arquivo |
|---|---|
| Registro duplicado → 409 | `test_auth.py::test_register_duplicate_email` |
| Login senha errada → 401 | `test_auth.py::test_login_wrong_password` |
| Endpoint protegido sem token → 401/403 | `test_auth.py::test_protected_endpoint_without_token` |
| Normalização do número de processo | `test_trademarks.py::test_create_trademark_normalizes_process_number` |
| Marca duplicada → 409 | `test_trademarks.py::test_create_duplicate_trademark` |
| Tenant A não acessa dados de tenant B | `test_trademarks.py::test_tenant_isolation` |
| Parse da edição e data do RPI | `test_rpi_parser.py` |

## Lacunas de cobertura de testes (conhecidas)

- Endpoints `/admin/*` não têm testes automatizados
- `process_rpi_edition` não tem testes (requer mock de `httpx`)
- Limite de plano (`402`) não tem teste
- Refresh token com token de acesso (deve retornar erro) não testado
