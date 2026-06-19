'use client'

import { useState } from 'react'
import { releaseCalendarAction, concludeCalendarAction } from '@/app/actions/calendars'
import { CalendarStatus } from '@/lib/types'

export default function CalendarActions({
  calendarId,
  status,
  allApproved,
}: {
  calendarId: string
  status: CalendarStatus
  allApproved: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRelease() {
    if (!confirm('Liberar este calendário para o cliente?')) return
    setLoading(true)
    const r = await releaseCalendarAction(calendarId)
    if (r?.error) { setError(r.error); setLoading(false) }
  }

  async function handleConclude() {
    if (!confirm('Marcar calendário como concluído?')) return
    setLoading(true)
    const r = await concludeCalendarAction(calendarId)
    if (r?.error) { setError(r.error); setLoading(false) }
  }

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-1 w-full sm:w-auto">
      {status === 'rascunho' && (
        <button
          onClick={handleRelease}
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Aguarde…' : 'Liberar para o cliente'}
        </button>
      )}
      {status === 'enviado' && allApproved && (
        <button
          onClick={handleConclude}
          disabled={loading}
          className="w-full sm:w-auto bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Aguarde…' : 'Marcar como concluído'}
        </button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
