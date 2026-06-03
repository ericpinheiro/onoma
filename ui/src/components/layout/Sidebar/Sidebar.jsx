'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Sidebar.module.scss'

const NAV_ITEMS = [
  { label: 'Visão geral', href: '/dashboard', icon: '◈' },
  { label: 'Marcas', href: '/dashboard/marcas', icon: '™' },
  { label: 'Billing', href: '/dashboard/billing', icon: '◎' },
  { label: 'Logs RPI', href: '/dashboard/logs', icon: '≡' },
  { section: 'Configurações' },
  { label: 'Webhooks', href: '/dashboard/webhooks', icon: '⌁' },
  { label: 'Fuso horário', href: '/dashboard/time', icon: '◷' },
  { label: 'Configurações', href: '/dashboard/configuracoes', icon: '⚙' },
  { label: 'Chaves de API', href: '/dashboard/api-keys', icon: '⌘' },
  { label: 'Documentação', href: '/dashboard/docs', icon: '⊞' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { tenant, user, logout } = useAuth()

  function handleLogout() {
    logout()
    router.push('/login')
  }

  const initials = tenant?.name
    ? tenant.name.slice(0, 2).toUpperCase()
    : '?'

  const emailInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.tenantBtn}>
          <div className={styles.tenantIcon}>{initials}</div>
          <span className={styles.tenantName}>{tenant?.name ?? 'Carregando...'}</span>
          <span className={styles.chevron}>⌄</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item, i) => {
          if (item.section) {
            return <div key={i} className={styles.section}>{item.section}</div>
          }
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')}
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <button className={styles.userBtn} onClick={handleLogout} title="Sair">
          <div className={styles.avatar}>{emailInitials}</div>
          <div className={styles.userInfo}>
            <div className={styles.userEmail}>{user?.email ?? ''}</div>
          </div>
        </button>
      </div>
    </aside>
  )
}
