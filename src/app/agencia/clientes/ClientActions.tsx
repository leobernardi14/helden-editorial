'use client'

import { useState } from 'react'
import { Client } from '@/lib/types'
import { updateClientAction, archiveClientAction, unarchiveClientAction, resetClientPasswordAction } from '@/app/actions/clients'

export default function ClientActions({ client }: { client: Client }) {
  const [editOpen, setEditOpen]         = useState(false)
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [resetOpen, setResetOpen]       = useState(false)
  const [name, setName]                 = useState(client.name)
  const [newPassword, setNewPassword]   = useState('')
  const [resetDone, setResetDone]       = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)

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

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData()
    fd.append('client_id', client.id)
    fd.append('password', newPassword)
    const result = await resetClientPasswordAction(fd)
    setLoading(false)
    if (result?.error) { setError(result.error); return }
    setResetDone(true)
  }

  function openReset() {
    setNewPassword('')
    setResetDone(false)
    setError(null)
    setResetOpen(true)
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
        <button
          onClick={openReset}
          className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md px-2 py-1 transition-colors"
        >
          Redefinir senha
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
                  className="flex-1 bg-helden-yellow text-black text-sm font-medium rounded-lg py-2.5 hover:brightness-90 disabled:opacity-50 transition-colors"
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
      {/* Modal de redefinição de senha */}
      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Redefinir senha</h2>
            <p className="text-sm text-gray-500 mb-4">
              Cliente: <span className="font-medium text-gray-800">{client.name}</span>
            </p>

            {resetDone ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
                  <p className="text-sm font-semibold text-green-800 mb-1">Senha redefinida com sucesso!</p>
                  <p className="text-sm text-green-700">
                    Repasse a nova senha ao cliente por um canal seguro (WhatsApp, e-mail, etc.). Ele poderá alterá-la depois se desejar.
                  </p>
                </div>
                <button
                  onClick={() => { setResetOpen(false); setResetDone(false) }}
                  className="w-full bg-helden-yellow text-black text-sm font-medium rounded-lg py-2.5 hover:brightness-90 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova senha <span className="text-gray-400 font-normal">(mín. 8 caracteres)</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="input"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}
                <p className="text-xs text-gray-400">
                  Tem certeza? A senha atual do cliente será substituída imediatamente.
                </p>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setResetOpen(false)}
                    className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || newPassword.length < 8}
                    className="flex-1 bg-helden-yellow text-black text-sm font-medium rounded-lg py-2.5 hover:brightness-90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Redefinindo…' : 'Confirmar reset'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
