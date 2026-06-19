'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCalendarAction, archiveCalendarAction, unarchiveCalendarAction } from '@/app/actions/calendars'

export default function CalendarEditArchiveActions({
  calendarId,
  title,
  referenceMonth,
  archived,
}: {
  calendarId: string
  title: string
  referenceMonth: string | null
  archived: boolean
}) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editMonth, setEditMonth] = useState(referenceMonth ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData()
    fd.set('id', calendarId)
    fd.set('title', editTitle)
    fd.set('reference_month', editMonth)
    const r = await updateCalendarAction(fd)
    setLoading(false)
    if (r?.error) { setError(r.error); return }
    setShowEdit(false)
    router.refresh()
  }

  async function handleArchive() {
    if (!confirm('Arquivar este calendário? Ele deixará de aparecer para o cliente.')) return
    setLoading(true)
    const r = await archiveCalendarAction(calendarId)
    setLoading(false)
    if (r?.error) { setError(r.error); return }
    router.refresh()
  }

  async function handleUnarchive() {
    if (!confirm('Desarquivar este calendário?')) return
    setLoading(true)
    const r = await unarchiveCalendarAction(calendarId)
    setLoading(false)
    if (r?.error) { setError(r.error); return }
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { setShowEdit(true); setError(null) }}
          className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
        >
          Editar
        </button>
        {archived ? (
          <button
            onClick={handleUnarchive}
            disabled={loading}
            className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            Desarquivar
          </button>
        ) : (
          <button
            onClick={handleArchive}
            disabled={loading}
            className="text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            Arquivar
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Editar calendário</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  className="input"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês de referência</label>
                <input
                  className="input"
                  placeholder="Ex.: Junho 2025"
                  value={editMonth}
                  onChange={e => setEditMonth(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-4 py-2 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
