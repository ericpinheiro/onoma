import api from './api'

export async function getTrademarks(skip = 0, limit = 50) {
  const res = await api.get('/trademarks', { params: { skip, limit } })
  return res.data
}

export async function getTrademark(id) {
  const res = await api.get(`/trademarks/${id}`)
  return res.data
}

export async function addTrademark(processNumber, name = '') {
  const body = { process_number: processNumber }
  if (name) body.name = name
  const res = await api.post('/trademarks', body)
  return res.data
}

export async function deleteTrademark(id) {
  await api.delete(`/trademarks/${id}`)
}

export async function getTrademarkHistory(id, skip = 0, limit = 50) {
  const res = await api.get(`/trademarks/${id}/history`, { params: { skip, limit } })
  return res.data
}
