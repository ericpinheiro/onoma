import api from './api'

export async function getTenant() {
  const res = await api.get('/tenants/me')
  return res.data
}

export async function updateTenant(name) {
  const res = await api.patch('/tenants/me', { name })
  return res.data
}
