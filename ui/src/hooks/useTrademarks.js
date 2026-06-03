import useSWR from 'swr'
import { getTrademarks, addTrademark, deleteTrademark } from '@/services/trademark.service'
import { useAuth } from '@/contexts/AuthContext'

export function useTrademarks(skip = 0, limit = 50) {
  const { user } = useAuth()
  const key = user ? ['/trademarks', skip, limit] : null

  const { data, error, mutate, isLoading } = useSWR(
    key,
    () => getTrademarks(skip, limit)
  )

  async function add(processNumber, name) {
    const created = await addTrademark(processNumber, name)
    mutate()
    return created
  }

  async function remove(id) {
    await deleteTrademark(id)
    mutate()
  }

  return {
    trademarks: data ?? [],
    error,
    loading: isLoading,
    add,
    remove,
    mutate,
  }
}
