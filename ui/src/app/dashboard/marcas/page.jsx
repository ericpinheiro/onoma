'use client'

import { useState } from 'react'
import { useTrademarks } from '@/hooks/useTrademarks'
import Topbar from '@/components/layout/Topbar/Topbar'
import Button from '@/components/ui/Button/Button'
import Spinner from '@/components/ui/Spinner/Spinner'
import TrademarkTable from '@/components/features/trademarks/TrademarkTable'
import AddTrademarkModal from '@/components/features/trademarks/AddTrademarkModal'
import styles from './page.module.scss'

export default function MarcasPage() {
  const { trademarks, loading, add, remove } = useTrademarks()
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Topbar
        title="Marcas"
        action={
          <Button size="sm" onClick={() => setShowModal(true)}>
            + Adicionar marca
          </Button>
        }
      />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Marcas monitoradas</h1>
          <p className={styles.sub}>{trademarks.length} marca(s) no workspace</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <Spinner />
        </div>
      ) : (
        <TrademarkTable
          trademarks={trademarks}
          onDelete={remove}
        />
      )}

      <AddTrademarkModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={add}
      />
    </>
  )
}
