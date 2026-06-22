import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/lib/types'
import PostCardCliente from './PostCardCliente'
import ProgressoBanner from './ProgressoBanner'

export default async function ClienteCalendarioPage({
  params,
}: {
  params: Promise<{ calendarId: string }>
}) {
  const { calendarId } = await params
  const supabase = await createClient()

  const { data: calendar } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .in('status', ['enviado', 'concluido'])
    .single()

  if (!calendar) notFound()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('calendar_id', calendarId)
    .eq('archived', false)
    .order('position')

  const postList = (posts ?? []) as Post[]

  return (
    <div>
      <div className="mb-5">
        <Link href="/cliente" className="text-sm text-gray-500 hover:text-black">← Voltar</Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2 leading-tight">{calendar.title}</h1>
        {calendar.reference_month && (
          <p className="text-sm text-gray-500 mt-0.5">{calendar.reference_month}</p>
        )}
      </div>

      {/* Banner de conclusão + barra de progresso (reactivos ao revalidatePath) */}
      <ProgressoBanner posts={postList} />

      {postList.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>Nenhum post neste calendário ainda.</p>
        </div>
      )}

      <div className="space-y-4">
        {postList.map((post, idx) => (
          <PostCardCliente
            key={post.id}
            post={post}
            index={idx}
            calendarId={calendarId}
            disabled={calendar.status === 'concluido'}
          />
        ))}
      </div>
    </div>
  )
}
