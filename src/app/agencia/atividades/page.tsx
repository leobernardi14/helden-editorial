import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ApprovalAction } from '@/lib/types'
import AtividadesFeed, { type HistoryItem, type PendingPost } from './AtividadesFeed'

const VALID_FILTERS = ['todos', 'aprovado', 'reprovado', 'ajuste', 'pendente'] as const
type FilterValue = (typeof VALID_FILTERS)[number]

export default async function AtividadesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const filter: FilterValue = VALID_FILTERS.includes(status as FilterValue)
    ? (status as FilterValue)
    : 'todos'

  const supabase = await createClient()

  // Feed de aprovações recentes
  let historyQuery = supabase
    .from('approval_history')
    .select(`
      id, action, comment, created_at,
      profiles(full_name, email),
      posts(
        id, caption, image_url, status, calendar_id,
        calendars(id, title, clients(name))
      )
    `)
    .order('created_at', { ascending: false })
    .limit(60)

  if (filter !== 'todos' && filter !== 'pendente') {
    historyQuery = historyQuery.eq('action', filter as ApprovalAction)
  }

  const { data: history } = await historyQuery

  // Contadores globais para os badges
  const { data: counts } = await supabase
    .from('posts')
    .select('status')

  const countMap: Record<string, number> = { pendente: 0, aprovado: 0, reprovado: 0, ajuste: 0 }
  ;(counts ?? []).forEach((p: { status: string }) => { countMap[p.status] = (countMap[p.status] ?? 0) + 1 })

  // Posts pendentes para o filtro "pendente" (não tem histórico)
  let pendingPosts: { id: string; caption: string | null; calendar_id: string; calendars: { title: string; clients: { name: string } | null } | null }[] = []
  if (filter === 'pendente') {
    const { data } = await supabase
      .from('posts')
      .select(`id, caption, calendar_id, calendars(title, clients(name))`)
      .eq('status', 'pendente')
      .order('created_at', { ascending: false })
      .limit(60)
    pendingPosts = (data as unknown as typeof pendingPosts) ?? []
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
          <p className="text-gray-500 text-sm mt-0.5">Últimas respostas dos clientes</p>
        </div>
        <Link href="/agencia" className="text-sm text-gray-500 hover:text-black">← Dashboard</Link>
      </div>

      {/* Filtros com badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'todos',     label: 'Todos',     count: null },
          { value: 'pendente',  label: 'Pendente',  count: countMap.pendente },
          { value: 'aprovado',  label: 'Aprovado',  count: countMap.aprovado },
          { value: 'reprovado', label: 'Reprovado', count: countMap.reprovado },
          { value: 'ajuste',    label: 'Ajuste',    count: countMap.ajuste },
        ].map(({ value, label, count }) => {
          const isActive = filter === value
          const colorMap: Record<string, string> = {
            pendente:  isActive ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            aprovado:  isActive ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100',
            reprovado: isActive ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100',
            ajuste:    isActive ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
            todos:     isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          }
          return (
            <Link
              key={value}
              href={value === 'todos' ? '/agencia/atividades' : `/agencia/atividades?status=${value}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${colorMap[value]}`}
            >
              {label}
              {count !== null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-black/10'}`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      <AtividadesFeed history={(history ?? []) as unknown as HistoryItem[]} filter={filter} pendingPosts={pendingPosts} />
    </div>
  )
}
