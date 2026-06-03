'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/ui/Logo/Logo'
import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'
import styles from './page.module.scss'

export default function SignupPage() {
  const { register } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [tenantName, setTenantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleStep1(e) {
    e.preventDefault()
    setError('')
    if (!tenantName.trim() || !email.trim() || !password.trim()) return
    setStep(2)
  }

  async function handleStep2(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(tenantName.trim(), email.trim(), password)
      setStep(3)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.form}>
          <div className={styles.logoWrap}>
            <Logo size={20} />
          </div>

          {step === 1 && (
            <>
              <div className={styles.stepHeader}>
                <p className={styles.stepLabel}>Passo 1 de 2</p>
                <h1 className={styles.stepTitle}>Crie sua conta</h1>
              </div>
              <form onSubmit={handleStep1}>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.fields}>
                  <Input
                    label="Nome da empresa"
                    placeholder="Acme Ltda."
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                  />
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
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" full>Continuar</Button>
              </form>
              <p className={styles.footer}>
                Já tem uma conta?{' '}
                <Link href="/login" className={styles.link}>Entrar</Link>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.stepHeader}>
                <p className={styles.stepLabel}>Passo 2 de 2</p>
                <h1 className={styles.stepTitle}>Forma de pagamento</h1>
              </div>
              <div className={styles.paymentNote}>
                <span>ℹ</span>
                <span>
                  Você só será cobrado quando houver uso. Hoje: <strong>R$0,00</strong>.
                  Adicione um cartão para continuar.
                </span>
              </div>
              <form onSubmit={handleStep2}>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.cardGrid}>
                  <Input label="Número do cartão" placeholder="1234 5678 9012 3456" />
                  <Input label="Validade" placeholder="MM/AA" />
                  <Input label="CVV" placeholder="123" />
                </div>
                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                  <Button variant="secondary" type="button" onClick={() => setStep(1)}>
                    Voltar
                  </Button>
                  <Button type="submit" full loading={loading}>
                    Criar conta
                  </Button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div className={styles.successWrap}>
              <div className={styles.successIcon}>✓</div>
              <h2 className={styles.successTitle}>Conta criada!</h2>
              <p className={styles.successSub}>
                Bem-vindo ao Onoma, <strong>{tenantName}</strong>.
                Sua conta está pronta para uso.
              </p>
              <Button full onClick={() => router.push('/dashboard')}>
                Ir para o dashboard
              </Button>
            </div>
          )}
        </div>
      </main>

      <aside className={styles.aside}>
        <p className={styles.asideTitle}>Por que o Onoma?</p>
        <div className={styles.asideItems}>
          {[
            { icon: '◎', title: 'Importação automática', desc: 'A RPI é importada toda terça-feira, sem precisar fazer nada.' },
            { icon: '⌁', title: 'Alertas instantâneos', desc: 'Webhooks e notificações em tempo real quando algo muda.' },
            { icon: '≡', title: 'Histórico completo', desc: 'Todo o histórico de status de cada marca, acessível via API.' },
            { icon: '⚙', title: 'Pay as you go', desc: 'Sem mensalidade fixa. Você paga apenas pelo que usar.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className={styles.asideItem}>
              <div className={styles.asideIcon}>{icon}</div>
              <div>
                <div className={styles.asideItemTitle}>{title}</div>
                <div className={styles.asideItemDesc}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.asidePricing}>
          <div className={styles.asidePricingRow}>
            <span>R$0,30 × marcas × 4 consultas/mês</span>
          </div>
          <div className={styles.asidePricingTotal}>
            <span className={styles.asidePricingTotalLabel}>Total hoje</span>
            <span className={styles.asidePricingTotalVal}>R$0,00</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
