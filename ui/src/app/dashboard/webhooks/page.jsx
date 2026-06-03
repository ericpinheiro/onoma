'use client'

import Topbar from '@/components/layout/Topbar/Topbar'
import Button from '@/components/ui/Button/Button'
import Input from '@/components/ui/Input/Input'
import Badge from '@/components/ui/Badge/Badge'
import styles from './page.module.scss'

export default function WebhooksPage() {
  return (
    <>
      <Topbar title="Webhooks" />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Webhooks</h1>
          <p className={styles.sub}>Receba notificações HTTP quando marcas mudarem de status</p>
        </div>
        <Button size="sm">+ Adicionar webhook</Button>
      </div>

      <div className={styles.card}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⌁</div>
          <div className={styles.emptyTitle}>Nenhum webhook configurado</div>
          <p className={styles.emptySub}>
            Configure um endpoint para receber notificações em tempo real quando
            o status de alguma marca for alterado.
          </p>
          <Button size="sm">Adicionar primeiro webhook</Button>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <div className={styles.cardTitle}>Formato do payload</div>
        <pre className={styles.codeBlock}>{`{
  "event": "trademark.status_changed",
  "trademark_id": "uuid",
  "process_number": "910123456",
  "old_status": "Em análise",
  "new_status": "Deferido",
  "changed_at": "2025-06-10T14:00:00Z"
}`}</pre>
      </div>
    </>
  )
}
