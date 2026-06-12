import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Post } from '@/lib/types'
import PostCardCliente from './PostCardCliente'

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
    .order('position')

  const postList = (posts ?? []) as Post[]
  const total = postList.length
  const done = postList.filter((p) => p.status !== 'pendente').length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div>
      <div className="mb-5">
        <Link href="/cliente" className="text-sm text-gray-500 hover:text-black">← Voltar</Link>
        <h1 className="text-xl font-bold text-gray-900 mt-2 leading-tight">{calendar.title}</h1>
        {calendar.reference_month && (
          <p className="text-sm text-gray-500 mt-0.5">{calendar.reference_month}</p>
        )}
      </div>

      {/* Barra de progresso */}
      {total > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Seu progresso</span>
            <span className="text-gray-500">{done} de {total} avaliados</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {done === total && total > 0 && (
            <p className="text-xs text-green-600 font-medium mt-2">
              ✓ Todos os posts avaliados!
            </p>
          )}
        </div>
      )}

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
