'use client'

import Topbar from '@/components/layout/Topbar/Topbar'
import Button from '@/components/ui/Button/Button'
import Badge from '@/components/ui/Badge/Badge'
import styles from './page.module.scss'

export default function ApiKeysPage() {
  return (
    <>
      <Topbar title="Chaves de API" />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Chaves de API</h1>
          <p className={styles.sub}>Gerencie as chaves para acesso programático</p>
        </div>
        <Button size="sm">+ Nova chave</Button>
      </div>

      <div className={styles.card}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>⌘</div>
          <div className={styles.emptyTitle}>Nenhuma chave de API criada</div>
          <p className={styles.emptySub}>
            Crie uma chave de API para integrar o Onoma com suas ferramentas e automações.
          </p>
          <Button size="sm">Criar primeira chave</Button>
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <div className={styles.cardTitle}>Documentação da API</div>
        <p className={styles.cardDesc}>
          A API do Onoma usa autenticação Bearer. Inclua sua chave no header:
        </p>
        <pre className={styles.code}>Authorization: Bearer sk-onoma-xxxxxxxxxxxx</pre>
        <div style={{ marginTop: 16 }}>
          <a
            href="https://onoma.up.railway.app/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="sm">Ver documentação completa ↗</Button>
          </a>
        </div>
      </div>
    </>
  )
}
