'use client'

import { useState } from 'react'

export default function GeneratePdfButton({ calendarId }: { calendarId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/agencia/calendarios/${calendarId}/copys-pdf`)
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setError(body?.error ?? 'Não foi possível gerar o PDF.')
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="(.+)"/)
      const fileName = match?.[1] ?? 'copys-aprovadas.pdf'

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError('Não foi possível gerar o PDF.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
      >
        {loading ? 'Gerando…' : 'Gerar PDF das copys'}
      </button>
      {error && <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>}
    </div>
  )
}
