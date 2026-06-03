'use client'

import Topbar from '@/components/layout/Topbar/Topbar'
import Button from '@/components/ui/Button/Button'
import styles from './page.module.scss'

const ENDPOINTS = [
  { method: 'GET', path: '/trademarks', desc: 'Listar marcas monitoradas' },
  { method: 'POST', path: '/trademarks', desc: 'Adicionar nova marca' },
  { method: 'GET', path: '/trademarks/{id}', desc: 'Detalhes de uma marca' },
  { method: 'DELETE', path: '/trademarks/{id}', desc: 'Remover marca' },
  { method: 'GET', path: '/trademarks/{id}/history', desc: 'Histórico de status' },
  { method: 'GET', path: '/tenants/me', desc: 'Dados do workspace atual' },
  { method: 'PATCH', path: '/tenants/me', desc: 'Atualizar workspace' },
]

const METHOD_COLOR = {
  GET: 'info',
  POST: 'success',
  DELETE: 'danger',
  PATCH: 'warn',
}

export default function DocsPage() {
  return (
    <>
      <Topbar title="Documentação" />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Documentação da API</h1>
          <p className={styles.sub}>
            Base URL: <code className={styles.baseUrl}>https://onoma.up.railway.app</code>
          </p>
        </div>
        <a href="https://onoma.up.railway.app/docs" target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm">Swagger UI ↗</Button>
        </a>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Autenticação</div>
        <p className={styles.cardDesc}>
          Todas as rotas (exceto login/registro) exigem um Bearer token no header.
        </p>
        <pre className={styles.code}>{`Authorization: Bearer <access_token>`}</pre>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <div className={styles.cardTitle}>Endpoints disponíveis</div>
        <div className={styles.endpointList}>
          {ENDPOINTS.map(({ method, path, desc }) => (
            <div key={path + method} className={styles.endpoint}>
              <span className={[styles.method, styles[method.toLowerCase()]].join(' ')}>
                {method}
              </span>
              <code className={styles.path}>{path}</code>
              <span className={styles.desc}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
