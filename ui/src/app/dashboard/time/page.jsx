'use client'

import Topbar from '@/components/layout/Topbar/Topbar'
import Button from '@/components/ui/Button/Button'
import styles from './page.module.scss'

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (UTC-3)' },
  { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
  { value: 'America/Belem', label: 'Belém (UTC-3)' },
  { value: 'America/Fortaleza', label: 'Fortaleza (UTC-3)' },
  { value: 'America/Recife', label: 'Recife (UTC-3)' },
  { value: 'UTC', label: 'UTC' },
]

export default function TimePage() {
  return (
    <>
      <Topbar title="Fuso horário" />
      <div className={styles.header}>
        <h1 className={styles.title}>Fuso horário</h1>
        <p className={styles.sub}>Configure como datas e horários são exibidos e notificações são enviadas</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Fuso horário do workspace</div>
        <p className={styles.cardDesc}>
          Este fuso será usado para exibir datas e agendar alertas.
        </p>
        <select className={styles.select} defaultValue="America/Sao_Paulo">
          {TIMEZONES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <div style={{ marginTop: 20 }}>
          <Button size="sm">Salvar</Button>
        </div>
      </div>
    </>
  )
}
