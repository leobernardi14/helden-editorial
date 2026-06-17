import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarWithStats, Client, Post } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import NewClientButton from './clientes/NewClientButton'
import ClientActions from './clientes/ClientActions'
import { postCompleto } from '@/lib/postProgress'

export default async function AgenciaDashboard({
  searchParams,
}: {
  searchParams: Promise<{ arquivados?: string }>
}) {
  const { arquivados } = await searchParams
  const showArchived = arquivados === '1'

  const supabase = await createClient()

  // Atividades recentes (últimas 5)
  const { data: recentActivity } = await supabase
    .from('approval_history')
    .select(`action, created_at, profiles(full_name, email), posts(calendar_id, calendars(title, clients(name)))`)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('archived', showArchived)
    .order('name')

  // Para cada cliente, busca os calendários com contagens de status dos posts
  const clientsWithData = await Promise.all(
    (clients ?? []).map(async (client: Client) => {
      const { data: calendars } = await supabase
        .from('calendars')
        .select(`*, posts(id, fase, status_copy, status_caption, status_art)`)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

      const enriched = (calendars ?? []).map((cal: { posts?: Pick<Post, 'id' | 'fase' | 'status_copy' | 'status_caption' | 'status_art'>[] } & Record<string, unknown>) => {
        const posts = cal.posts ?? []
        return {
          ...cal,
          total_posts: posts.length,
          done: posts.filter((p) => postCompleto(p as Post)).length,
        } as CalendarWithStats
      })

      return { ...client, calendars: enriched }
    })
  )

  // Conta arquivados para exibir no toggle
  const { count: archivedCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('archived', true)

  const actionDot: Record<string, string> = {
    aprovado: 'bg-green-500', reprovado: 'bg-red-500', ajuste: 'bg-yellow-500',
  }
  const actionLabel: Record<string, string> = {
    aprovado: 'Aprovado', reprovado: 'Reprovado', ajuste: 'Ajuste',
  }

  return (
    <div>
      {/* Card de atividades recentes */}
      {(recentActivity ?? []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Atividades recentes</h2>
            <Link href="/agencia/atividades" className="text-xs text-gray-400 hover:text-black">Ver todas →</Link>
          </div>
          <div className="space-y-2">
            {(recentActivity as unknown as {
              action: string; created_at: string;
              profiles: { full_name: string | null; email: string } | null;
              posts: { calendar_id: string; calendars: { title: string; clients: { name: string } | null } | null } | null;
            }[]).map((item, i) => (
              <Link
                key={i}
                href={item.posts?.calendar_id ? `/agencia/calendarios/${item.posts.calendar_id}` : '#'}
                className="flex items-center gap-2 text-sm hover:bg-gray-50 rounded-lg p-1 -mx-1 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${actionDot[item.action] ?? 'bg-gray-300'}`} />
                <span className="text-gray-500 shrink-0">{actionLabel[item.action]}</span>
                <span className="text-gray-700 font-medium truncate">
                  {item.profiles?.full_name ?? item.profiles?.email}
                </span>
                <span className="text-gray-400 text-xs shrink-0 ml-auto">
                  {new Date(item.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {showArchived ? 'Clientes arquivados' : 'Clientes'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {clientsWithData.length} cliente{clientsWithData.length !== 1 ? 's' : ''}
            {showArchived ? ' arquivado' : ' ativo'}{clientsWithData.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showArchived ? (
            <Link
              href="/agencia"
              className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              ← Voltar aos ativos
            </Link>
          ) : (
            <>
              {(archivedCount ?? 0) > 0 && (
                <Link
                  href="/agencia?arquivados=1"
                  className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Ver arquivados ({archivedCount})
                </Link>
              )}
              <NewClientButton />
            </>
          )}
        </div>
      </div>

      {clientsWithData.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">
            {showArchived ? 'Nenhum cliente arquivado' : 'Nenhum cliente ainda'}
          </p>
          {!showArchived && <p className="text-sm mt-1">Clique em "Novo cliente" para começar.</p>}
        </div>
      )}

      <div className="space-y-4">
        {clientsWithData.map((client) => (
          <div
            key={client.id}
            className={`bg-white rounded-xl border p-5 ${client.archived ? 'border-gray-200 opacity-80' : 'border-gray-100'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-gray-900 text-lg">{client.name}</h2>
                {client.archived && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Arquivado</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!client.archived && (
                  <Link
                    href={`/agencia/clientes/${client.id}/novo-calendario`}
                    className="text-sm text-black bg-helden-yellow font-medium rounded-lg px-3 py-1.5 hover:brightness-90 transition-colors"
                  >
                    + Calendário
                  </Link>
                )}
                <ClientActions client={client} />
              </div>
            </div>

            {client.calendars.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum calendário ainda.</p>
            )}

            <div className="space-y-2">
              {client.calendars.map((cal) => (
                <Link
                  key={cal.id}
                  href={`/agencia/calendarios/${cal.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge status={cal.status} />
                    <span className="text-sm font-medium text-gray-800 truncate group-hover:text-black">
                      {cal.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0 text-xs text-gray-500">
                    {cal.total_posts > 0 ? (
                      <>
                        <span className={cal.done === cal.total_posts ? 'text-green-600 font-medium' : ''}>
                          {cal.done} de {cal.total_posts} completos
                        </span>
                        {cal.done === cal.total_posts && (
                          <span className="text-green-600">✓</span>
                        )}
                      </>
                    ) : (
                      <span>Sem posts</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
