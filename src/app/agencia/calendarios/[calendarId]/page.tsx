import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import PostList from './PostList'
import CalendarActions from './CalendarActions'
import CalendarEditArchiveActions from './CalendarEditArchiveActions'
import GeneratePdfButton from './GeneratePdfButton'
import { Post } from '@/lib/types'

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ calendarId: string }>
}) {
  const { calendarId } = await params
  const supabase = await createClient()

  const { data: calendar } = await supabase
    .from('calendars')
    .select(`*, clients(name)`)
    .eq('id', calendarId)
    .single()

  if (!calendar) notFound()

  const { data: allPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('position')

  const posts = (allPosts ?? []).filter((p: Post) => !p.archived)
  const archivedPosts = (allPosts ?? []).filter((p: Post) => p.archived)

  const postIds = (allPosts ?? []).map((p: Post) => p.id)
  const { data: historyRows } = postIds.length > 0
    ? await supabase.from('approval_history').select('post_id').in('post_id', postIds)
    : { data: [] as { post_id: string }[] }

  const postsWithHistoryIds = Array.from(new Set((historyRows ?? []).map((h) => h.post_id)))

  const allApproved =
    posts.length > 0 &&
    posts.every((p: Post) => p.status === 'aprovado')

  return (
    <div>
      <div className="mb-6">
        <Link href="/agencia" className="text-sm text-gray-500 hover:text-black">← Voltar</Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-2 gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight break-words">{calendar.title}</h1>
              {calendar.archived && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Arquivado</span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5 break-words">
              {(calendar.clients as { name: string }).name}
              {calendar.reference_month && <> · {calendar.reference_month}</>}
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={calendar.status} />
              <CalendarActions
                calendarId={calendarId}
                status={calendar.status}
                allApproved={allApproved}
              />
            </div>
            <CalendarEditArchiveActions
              calendarId={calendarId}
              title={calendar.title}
              referenceMonth={calendar.reference_month}
              archived={calendar.archived ?? false}
            />
            <GeneratePdfButton calendarId={calendarId} />
          </div>
        </div>
      </div>

      <PostList
        posts={posts}
        archivedPosts={archivedPosts}
        postsWithHistoryIds={postsWithHistoryIds}
        calendarId={calendarId}
        calendarStatus={calendar.status}
      />
    </div>
  )
}
