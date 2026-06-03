'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal/Modal'
import Input from '@/components/ui/Input/Input'
import Button from '@/components/ui/Button/Button'

export default function AddTrademarkModal({ open, onClose, onAdd }) {
  const [processNumber, setProcessNumber] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!processNumber.trim()) {
      setError('Informe o número do processo')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onAdd(processNumber.trim(), name.trim())
      setProcessNumber('')
      setName('')
      onClose()
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Erro ao adicionar marca')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar marca">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Número do processo *"
          placeholder="ex: 910123456"
          value={processNumber}
          onChange={(e) => setProcessNumber(e.target.value)}
          error={error}
        />
        <Input
          label="Nome (opcional)"
          placeholder="ex: Minha Marca"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Adicionar</Button>
        </div>
      </form>
    </Modal>
  )
}
