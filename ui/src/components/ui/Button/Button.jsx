import styles from './Button.module.scss'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  className = '',
  ...props
}) {
  const cls = [
    styles.btn,
    styles[variant],
    size !== 'md' ? styles[size] : '',
    full ? styles.full : '',
    loading ? styles.loading : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={cls} disabled={loading || props.disabled} {...props}>
      {children}
    </button>
  )
}
