import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, Post } from '@/lib/types'
import { postCompleto, calendarDisplayStatus, calendarDisplayBadge } from '@/lib/postProgress'

export default async function ClienteDashboard() {
  const supabase = await createClient()

  const { data: calendars } = await supabase
    .from('calendars')
    .select(`*, posts(id, fase, status_copy, status_caption, status_art, scheduled, archived)`)
    .in('status', ['enviado', 'concluido'])
    .eq('archived', false)
    .order('created_at', { ascending: false })

  type CalWithPosts = Calendar & { posts: Pick<Post, 'id' | 'fase' | 'status_copy' | 'status_caption' | 'status_art' | 'scheduled' | 'archived'>[] }

  const enriched = (calendars as CalWithPosts[] ?? []).map((cal) => {
    const posts = cal.posts ?? []
    const activePosts = posts.filter((p) => !p.archived)
    const total = activePosts.length
    const done = activePosts.filter((p) => postCompleto(p as Post)).length
    const displayStatus = calendarDisplayStatus(posts as Post[], cal.status)
    return { ...cal, total, done, displayStatus }
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Meus Calendários</h1>
      <p className="text-gray-500 text-sm mb-6">{enriched.length} calendário{enriched.length !== 1 ? 's' : ''} {enriched.length !== 1 ? 'disponíveis' : 'disponível'}</p>

      {enriched.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Nenhum calendário disponível</p>
          <p className="text-sm mt-1">Aguarde a agência liberar um calendário para você.</p>
        </div>
      )}

      <div className="space-y-3">
        {enriched.map((cal) => {
          const progress = cal.total > 0 ? Math.round((cal.done / cal.total) * 100) : 0
          return (
            <Link
              key={cal.id}
              href={`/cliente/calendarios/${cal.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{cal.title}</p>
                  {cal.reference_month && (
                    <p className="text-xs text-gray-400 mt-0.5">{cal.reference_month}</p>
                  )}
                </div>
                {(() => { const b = calendarDisplayBadge(cal.displayStatus); return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${b.cls}`}>{b.label}</span> })()}
              </div>

              {cal.total > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{cal.done} de {cal.total} avaliados</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-helden-yellow rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
