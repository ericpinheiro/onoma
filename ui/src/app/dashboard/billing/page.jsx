'use client'

import { useTrademarks } from '@/hooks/useTrademarks'
import Topbar from '@/components/layout/Topbar/Topbar'
import KpiCard from '@/components/ui/KpiCard/KpiCard'
import Badge from '@/components/ui/Badge/Badge'
import styles from './page.module.scss'

export default function BillingPage() {
  const { trademarks } = useTrademarks()
  const active = trademarks.length
  const cost = (active * 0.30).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <>
      <Topbar title="Billing" />
      <div className={styles.header}>
        <h1 className={styles.title}>Billing</h1>
        <p className={styles.sub}>Acompanhe seu consumo e faturas</p>
      </div>

      <div className={styles.kpis}>
        <KpiCard label="Marcas ativas" value={active} />
        <KpiCard label="Custo estimado" value={cost} sub="este mês" />
        <KpiCard label="Próxima fatura" value="—" sub="sem dados" />
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Fatura em aberto</span>
          <Badge variant="warn">Em processamento</Badge>
        </div>
        <div className={styles.invoiceRow}>
          <span>Monitoramento de marcas ({active} × R$0,30)</span>
          <span className="mono">{cost}</span>
        </div>
        <div className={styles.invoiceDivider} />
        <div className={[styles.invoiceRow, styles.total].join(' ')}>
          <span>Total</span>
          <span className="mono">{cost}</span>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Forma de pagamento</span>
        </div>
        <div className={styles.cardOnFile}>
          <span className={styles.cardIcon}>💳</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>•••• •••• •••• 4242</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Expira 12/26</div>
          </div>
        </div>
      </div>
    </>
  )
}
