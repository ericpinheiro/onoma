import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('onoma_access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 → try to refresh token, retry original request
let isRefreshing = false
let failedQueue = []

function processQueue(error, token = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((e) => Promise.reject(e))
      }
      original._retry = true
      isRefreshing = true
      const refresh = typeof window !== 'undefined' ? localStorage.getItem('onoma_refresh_token') : null
      if (!refresh) {
        isRefreshing = false
        clearTokens()
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(error)
      }
      try {
        const res = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refresh })
        const { access_token, refresh_token } = res.data
        localStorage.setItem('onoma_access_token', access_token)
        localStorage.setItem('onoma_refresh_token', refresh_token)
        api.defaults.headers.common.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)
        original.headers.Authorization = `Bearer ${access_token}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        clearTokens()
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('onoma_access_token')
    localStorage.removeItem('onoma_refresh_token')
  }
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('onoma_access_token', accessToken)
  localStorage.setItem('onoma_refresh_token', refreshToken)
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('onoma_access_token')
}

export default api
