import styles from './Badge.module.scss'

export default function Badge({ children, variant = 'default', dot = false, className = '' }) {
  return (
    <span className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  )
}
