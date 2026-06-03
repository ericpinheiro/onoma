'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar/Topbar'
import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'
import { useTenant } from '@/hooks/useTenant'
import styles from './page.module.scss'

export default function ConfiguracoesPage() {
  const { tenant, update } = useTenant()
  const [name, setName] = useState(tenant?.name ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await update(name.trim())
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Topbar title="Configurações" />
      <div className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.sub}>Gerencie as configurações do seu workspace</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Informações do workspace</div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nome do workspace"
            value={name || tenant?.name || ''}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da empresa"
          />
          <div className={styles.formFooter}>
            {saved && <span className={styles.savedMsg}>Salvo com sucesso!</span>}
            <Button size="sm" type="submit" loading={loading}>Salvar</Button>
          </div>
        </form>
      </div>

      <div className={styles.card} style={{ marginTop: 16, borderColor: 'rgba(220,38,38,.3)' }}>
        <div className={styles.cardTitle} style={{ color: 'var(--danger)' }}>Zona de perigo</div>
        <p className={styles.cardDesc}>
          Estas ações são irreversíveis. Prossiga com cuidado.
        </p>
        <Button variant="danger" size="sm">Excluir workspace</Button>
      </div>
    </>
  )
}
