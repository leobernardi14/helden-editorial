'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { unarchiveCalendarAction } from '@/app/actions/calendars'

export default function UnarchiveCalendarButton({ calendarId }: { calendarId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm('Desarquivar este calendário?')) return
    setLoading(true)
    await unarchiveCalendarAction(calendarId)
    router.refresh()
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded-md px-2.5 py-1 transition-colors disabled:opacity-50 shrink-0"
    >
      {loading ? '…' : 'Desarquivar'}
    </button>
  )
}
