import Link from 'next/link'
import Logo from '@/components/ui/Logo/Logo'
import Button from '@/components/ui/Button/Button'
import styles from './MarketingNav.module.scss'

export default function MarketingNav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Logo size={20} />
        </Link>

        <div className={styles.links}>
          <Link href="#como-funciona" className={styles.link}>Como funciona</Link>
          <Link href="#precos" className={styles.link}>Preços</Link>
          <Link href="#api" className={styles.link}>API</Link>
        </div>

        <div className={styles.actions}>
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Começar grátis</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
