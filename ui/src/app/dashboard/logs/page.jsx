'use client'

import Topbar from '@/components/layout/Topbar/Topbar'
import Badge from '@/components/ui/Badge/Badge'
import styles from './page.module.scss'

const MOCK_LOGS = [
  { rpi: 2818, date: '2025-06-10', status: 'success', trademarks: 142, changes: 5 },
  { rpi: 2817, date: '2025-06-03', status: 'success', trademarks: 98, changes: 2 },
  { rpi: 2816, date: '2025-05-27', status: 'success', trademarks: 211, changes: 8 },
  { rpi: 2815, date: '2025-05-20', status: 'warn', trademarks: 75, changes: 0 },
]

export default function LogsPage() {
  return (
    <>
      <Topbar title="Logs RPI" />
      <div className={styles.header}>
        <h1 className={styles.title}>Logs de importação RPI</h1>
        <p className={styles.sub}>Histórico das importações semanais da Revista da Propriedade Industrial</p>
      </div>

      <div className={styles.table}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['RPI', 'Data', 'Status', 'Marcas processadas', 'Mudanças detectadas'].map((h) => (
                <th key={h} className={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_LOGS.map((log) => (
              <tr key={log.rpi} className={styles.tr}>
                <td className={styles.td}><span className="mono">{log.rpi}</span></td>
                <td className={styles.td}>{new Date(log.date).toLocaleDateString('pt-BR')}</td>
                <td className={styles.td}>
                  <Badge variant={log.status === 'success' ? 'success' : 'warn'} dot>
                    {log.status === 'success' ? 'Sucesso' : 'Parcial'}
                  </Badge>
                </td>
                <td className={styles.td}>{log.trademarks}</td>
                <td className={styles.td}>{log.changes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
