import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import PostList from './PostList'
import CalendarActions from './CalendarActions'
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

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('position')

  const allApproved =
    (posts ?? []).length > 0 &&
    (posts ?? []).every((p: Post) => p.status === 'aprovado')

  return (
    <div>
      <div className="mb-6">
        <Link href="/agencia" className="text-sm text-gray-500 hover:text-black">← Voltar</Link>
        <div className="flex items-start justify-between mt-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{calendar.title}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {(calendar.clients as { name: string }).name}
              {calendar.reference_month && (
                <> · {new Date(calendar.reference_month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={calendar.status} />
            <CalendarActions
              calendarId={calendarId}
              status={calendar.status}
              allApproved={allApproved}
            />
          </div>
        </div>
      </div>

      <PostList posts={posts ?? []} calendarId={calendarId} calendarStatus={calendar.status} />
    </div>
  )
}
