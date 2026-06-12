'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createCalendarAction } from '@/app/actions/calendars'

export default function NovoCalendarioForm({
  clientId,
  cancelHref,
}: {
  clientId: string
  cancelHref: string
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createCalendarAction(new FormData(e.currentTarget))
    // redirect() lança exceção internamente — só chega aqui se houve erro real
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="client_id" value={clientId} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
        <input
          name="title"
          required
          className="input"
          placeholder="Ex.: Calendário Editorial — Junho/2026"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mês de referência <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input name="reference_month" type="month" className="input" />
        <p className="text-xs text-gray-400 mt-1">Selecione usando o calendário do campo acima.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href={cancelHref}
          className="flex-1 text-center text-sm text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white text-sm font-medium rounded-lg py-2.5 hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Criando…' : 'Criar calendário'}
        </button>
      </div>
    </form>
  )
}
