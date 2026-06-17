'use client'

import { useState } from 'react'
import { createClientAction } from '@/app/actions/clients'

export default function NewClientButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const result = await createClientAction(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setOpen(false)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(null) }}
        className="bg-helden-yellow text-black text-sm font-medium px-4 py-2 rounded-lg hover:brightness-90 transition-colors"
      >
        + Novo cliente
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Novo cliente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da empresa *</label>
                <input name="name" required className="input" placeholder="Ex.: Roca Imóveis" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do contato</label>
                <input name="full_name" className="input" placeholder="Ex.: João Silva" />
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Login do cliente</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                    <input name="email" type="email" required className="input" placeholder="cliente@empresa.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha provisória *</label>
                    <input name="password" type="text" required minLength={6} className="input" placeholder="Mínimo 6 caracteres" />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-helden-yellow text-black text-sm font-medium rounded-lg py-2.5 hover:brightness-90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Criando…' : 'Criar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
