import styles from './Spinner.module.scss'

export default function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
    />
  )
}
