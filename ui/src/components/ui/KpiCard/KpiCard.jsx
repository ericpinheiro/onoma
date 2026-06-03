import styles from './KpiCard.module.scss'

export default function KpiCard({ label, value, sub }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  )
}
