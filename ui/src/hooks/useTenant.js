import useSWR from 'swr'
import { getTenant, updateTenant } from '@/services/tenant.service'
import { useAuth } from '@/contexts/AuthContext'

export function useTenant() {
  const { user } = useAuth()
  const { data, error, mutate, isLoading } = useSWR(
    user ? '/tenants/me' : null,
    () => getTenant()
  )

  async function update(name) {
    const updated = await updateTenant(name)
    mutate(updated)
    return updated
  }

  return { tenant: data, error, loading: isLoading, update, mutate }
}
