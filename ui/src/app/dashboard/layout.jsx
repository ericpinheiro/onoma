'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Sidebar from '@/components/layout/Sidebar/Sidebar'
import Spinner from '@/components/ui/Spinner/Spinner'
import styles from './layout.module.scss'

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spinner size={28} />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.content}>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
