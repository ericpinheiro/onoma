import styles from './Topbar.module.scss'

export default function Topbar({ title, action }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.breadcrumb}>
          <span>Onoma</span>
          <span className={styles.sep}>/</span>
          <span>{title}</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            type="search"
            placeholder="Buscar..."
            className={styles.search}
          />
        </div>
        {action}
      </div>
    </header>
  )
}
