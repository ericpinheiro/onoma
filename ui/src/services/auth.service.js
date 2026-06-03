import axios from 'axios'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function login(email, password) {
  const res = await axios.post(`${BASE}/auth/login`, { email, password })
  return res.data // { access_token, refresh_token, token_type }
}

export async function register(tenantName, email, password) {
  const res = await axios.post(`${BASE}/auth/register`, {
    tenant_name: tenantName,
    email,
    password,
  })
  return res.data
}
