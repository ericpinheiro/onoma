'use client'

import { useTrademarks } from '@/hooks/useTrademarks'
import { useTenant } from '@/hooks/useTenant'
import Topbar from '@/components/layout/Topbar/Topbar'
import KpiCard from '@/components/ui/KpiCard/KpiCard'
import Spinner from '@/components/ui/Spinner/Spinner'
import styles from './page.module.scss'

const ACTIVITY = [
  { text: 'Marca "Alfa Tech" — status alterado para Deferido', time: '2h atrás', type: 'success' },
  { text: 'RPI 2816 importada com sucesso — 3 mudanças detectadas', time: '5h atrás', type: 'success' },
  { text: 'Marca "Beta Corp" — Oposição registrada', time: 'Ontem', type: 'warn' },
  { text: 'Webhook entregue para staging.empresa.com', time: 'Ontem', type: '' },
]

const CHART_DATA = [12, 8, 15, 6, 20, 18, 25, 14, 10, 22, 16, 9]

export default function DashboardPage() {
  const { trademarks, loading } = useTrademarks()
  const { tenant } = useTenant()

  const active = trademarks.length
  const recentUpdates = trademarks.filter((t) => t.updated_at).length
  const cost = (active * 0.30).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const maxVal = Math.max(...CHART_DATA)

  return (
    <>
      <Topbar title="Visão geral" />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Visão geral</h1>
          <p className={styles.sub}>
            {tenant ? `Workspace: ${tenant.name}` : 'Carregando...'}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Spinner />
        </div>
      ) : (
        <>
          <div className={styles.kpis}>
            <KpiCard label="Marcas monitoradas" value={active} sub="ativas" />
            <KpiCard label="Atualizações" value={recentUpdates} sub="este mês" />
            <KpiCard label="Custo estimado" value={cost} sub="/mês" />
            <KpiCard label="Última RPI" value="—" sub="sem dados" />
          </div>

          <div className={styles.row}>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Consultas por mês</div>
              <div className={styles.chart}>
                {CHART_DATA.map((val, i) => (
                  <div key={i} className={styles.bar} title={`${val} consultas`}>
                    <div
                      className={styles.barFill}
                      style={{ height: `${(val / maxVal) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Atividade recente</div>
              <div className={styles.logList}>
                {ACTIVITY.map((item, i) => (
                  <div key={i} className={styles.logItem}>
                    <div className={[styles.logDot, item.type ? styles[item.type] : ''].filter(Boolean).join(' ')} />
                    <div className={styles.logText}>{item.text}</div>
                    <div className={styles.logTime}>{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
