'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/ui/Logo/Logo'
import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'
import styles from './page.module.scss'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo size={20} />
        </div>
        <h1 className={styles.title}>Bem-vindo de volta</h1>
        <p className={styles.sub}>Entre com sua conta para continuar</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          <Input
            label="Email"
            type="email"
            placeholder="voce@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" full loading={loading}>
            Entrar
          </Button>
        </form>

        <p className={styles.footer}>
          Não tem uma conta?{' '}
          <Link href="/signup" className={styles.link}>Criar conta</Link>
        </p>
      </div>
    </main>
  )
}
