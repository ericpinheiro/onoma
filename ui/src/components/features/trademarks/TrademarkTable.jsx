import Badge from '@/components/ui/Badge/Badge'
import Button from '@/components/ui/Button/Button'
import styles from './TrademarkTable.module.scss'

function statusVariant(status) {
  if (!status) return 'default'
  const s = status.toLowerCase()
  if (s.includes('deferido') || s.includes('registrado')) return 'success'
  if (s.includes('indeferido') || s.includes('extinto') || s.includes('caducado')) return 'danger'
  if (s.includes('oposição') || s.includes('recurso') || s.includes('nulidade')) return 'warn'
  return 'info'
}

export default function TrademarkTable({ trademarks, onDelete }) {
  if (!trademarks.length) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>
          Nenhuma marca monitorada ainda. Adicione a primeira!
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Processo</th>
            <th className={styles.th}>Nome</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Última atualização</th>
            <th className={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {trademarks.map((tm) => (
            <tr key={tm.id} className={styles.tr}>
              <td className={styles.td}>
                <span className={styles.process}>{tm.process_number}</span>
              </td>
              <td className={styles.td}>
                <span className={styles.name}>{tm.name || '—'}</span>
              </td>
              <td className={styles.td}>
                {tm.current_status ? (
                  <Badge variant={statusVariant(tm.current_status)} dot>
                    {tm.current_status}
                  </Badge>
                ) : (
                  <span style={{ color: 'var(--fg-disabled)' }}>—</span>
                )}
              </td>
              <td className={styles.td} style={{ color: 'var(--fg-muted)' }}>
                {tm.updated_at
                  ? new Date(tm.updated_at).toLocaleDateString('pt-BR')
                  : '—'}
              </td>
              <td className={styles.td}>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.deleteBtn}
                    onClick={() => onDelete(tm.id)}
                    title="Remover"
                  >
                    ✕
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
