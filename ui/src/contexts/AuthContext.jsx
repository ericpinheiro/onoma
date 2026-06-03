'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { login as apiLogin, register as apiRegister } from '@/services/auth.service'
import { getTenant } from '@/services/tenant.service'
import { setTokens, clearTokens, getAccessToken } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [tenant, setTenant] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      const data = await getTenant()
      setTenant(data)
      setUser({ email: data.admin_email ?? null, tenantId: data.id })
    } catch {
      clearTokens()
      setUser(null)
      setTenant(null)
    }
  }, [])

  useEffect(() => {
    const token = getAccessToken()
    if (token) {
      loadUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [loadUser])

  const login = useCallback(async (email, password) => {
    const { access_token, refresh_token } = await apiLogin(email, password)
    setTokens(access_token, refresh_token)
    await loadUser()
  }, [loadUser])

  const register = useCallback(async (tenantName, email, password) => {
    const { access_token, refresh_token } = await apiRegister(tenantName, email, password)
    setTokens(access_token, refresh_token)
    await loadUser()
  }, [loadUser])

  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
    setTenant(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, tenant, loading, login, register, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
