'use client'

import Link from 'next/link'
import { ApprovalAction } from '@/lib/types'

export type HistoryItem = {
  id: string
  action: ApprovalAction
  comment: string | null
  created_at: string
  profiles: { full_name: string | null; email: string } | null
  posts: {
    id: string
    caption: string | null
    image_url: string | null
    status: string
    calendar_id: string
    calendars: {
      id: string
      title: string
      clients: { name: string } | null
    } | null
  } | null
}

export type PendingPost = {
  id: string
  caption: string | null
  calendar_id: string
  calendars: { title: string; clients: { name: string } | null } | null
}

const actionStyle: Record<ApprovalAction, { label: string; dot: string; text: string; bg: string }> = {
  aprovado:  { label: 'Aprovado',  dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50' },
  reprovado: { label: 'Reprovado', dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50' },
  ajuste:    { label: 'Ajuste',    dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  const d = Math.floor(h / 24)
  return `há ${d} dia${d > 1 ? 's' : ''}`
}

export default function AtividadesFeed({
  history,
  filter,
  pendingPosts,
}: {
  history: HistoryItem[]
  filter: string
  pendingPosts: PendingPost[]
}) {
  if (filter === 'pendente') {
    if (pendingPosts.length === 0) {
      return <Empty label="Nenhum post pendente. Tudo avaliado!" />
    }
    return (
      <div className="space-y-2">
        {pendingPosts.map((post) => (
          <Link
            key={post.id}
            href={`/agencia/calendarios/${post.calendar_id}`}
            className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-700 truncate">
                {post.caption ?? <span className="italic text-gray-400">Sem legenda</span>}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {post.calendars?.clients?.name} · {post.calendars?.title}
              </p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Pendente</span>
          </Link>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return <Empty label="Nenhuma atividade encontrada para este filtro." />
  }

  return (
    <div className="space-y-2">
      {history.map((item) => {
        const cfg = actionStyle[item.action]
        const calendarId = item.posts?.calendar_id
        const clientName = item.posts?.calendars?.clients?.name
        const calTitle = item.posts?.calendars?.title
        const author = item.profiles?.full_name ?? item.profiles?.email ?? 'Cliente'

        return (
          <Link
            key={item.id}
            href={calendarId ? `/agencia/calendarios/${calendarId}` : '#'}
            className="flex gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors"
          >
            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
                <span className="text-sm text-gray-700 font-medium">{author}</span>
                <span className="text-xs text-gray-400">{timeAgo(item.created_at)}</span>
              </div>
              {clientName && calTitle && (
                <p className="text-xs text-gray-400 mt-0.5">{clientName} · {calTitle}</p>
              )}
              {item.posts?.caption && (
                <p className="text-xs text-gray-500 mt-1 truncate">"{item.posts.caption}"</p>
              )}
              {item.comment && (
                <p className={`text-sm mt-2 p-2.5 rounded-lg border ${cfg.bg} ${cfg.text} border-yellow-100 whitespace-pre-line`}>
                  {item.comment}
                </p>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div className="text-center py-16 text-gray-400">
      <p>{label}</p>
    </div>
  )
}
