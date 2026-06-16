'use client'

import { useState } from 'react'
import { Client } from '@/lib/types'
import { updateClientAction, archiveClientAction, unarchiveClientAction } from '@/app/actions/clients'

export default function ClientActions({ client }: { client: Client }) {
  const [editOpen, setEditOpen]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [name, setName]               = useState(client.name)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setError(null)
    setLoading(true)
    const fd = new FormData()
    fd.append('id', client.id)
    fd.append('name', name.trim())
    const result = await updateClientAction(fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    setEditOpen(false)
  }

  async function handleArchive() {
    setLoading(true)
    const result = await archiveClientAction(client.id)
    setLoading(false)
    if (result?.error) { setError(result.error) }
    setConfirmOpen(false)
  }

  async function handleUnarchive() {
    setLoading(true)
    const result = await unarchiveClientAction(client.id)
    setLoading(false)
    if (result?.error) { setError(result.error) }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setEditOpen(true); setName(client.name); setError(null) }}
          className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded-md px-2 py-1 transition-colors"
        >
          Editar
        </button>
        {client.archived ? (
          <button
            onClick={handleUnarchive}
            disabled={loading}
            className="text-xs text-green-600 hover:text-green-800 border border-green-200 rounded-md px-2 py-1 transition-colors disabled:opacity-50"
          >
            {loading ? '…' : 'Desarquivar'}
          </button>
        ) : (
          <button
            onClick={() => { setConfirmOpen(true); setError(null) }}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-md px-2 py-1 transition-colors"
          >
            Arquivar
          </button>
        )}
      </div>

      {/* Modal de edição */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Editar cliente</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da empresa *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input"
                  placeholder="Nome do cliente"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex-1 bg-black text-white text-sm font-medium rounded-lg py-2.5 hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmação de arquivamento */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Arquivar cliente?</h2>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">{client.name}</span> será removido da lista principal.
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Todos os calendários e histórico permanecem intactos. O login do cliente será bloqueado até o desarquivamento. Você pode reverter isso a qualquer momento em "Ver arquivados".
            </p>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleArchive}
                disabled={loading}
                className="flex-1 bg-red-600 text-white text-sm font-medium rounded-lg py-2.5 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Arquivando…' : 'Sim, arquivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
