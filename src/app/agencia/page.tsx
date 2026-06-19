import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarWithStats, Client, Post } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import NewClientButton from './clientes/NewClientButton'
import ClientActions from './clientes/ClientActions'
import UnarchiveCalendarButton from './calendarios/UnarchiveCalendarButton'
import { postCompleto } from '@/lib/postProgress'

export default async function AgenciaDashboard({
  searchParams,
}: {
  searchParams: Promise<{ arquivados?: string; cal_arq?: string }>
}) {
  const { arquivados, cal_arq } = await searchParams
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

  // Para cada cliente: calendários ativos + contagem de arquivados + (se expandido) calendários arquivados
  const clientsWithData = await Promise.all(
    (clients ?? []).map(async (client: Client) => {
      const showArchivedCals = cal_arq === client.id

      const [activeRes, archivedCountRes, archivedCalsRes] = await Promise.all([
        supabase
          .from('calendars')
          .select(`*, posts(id, fase, status_copy, status_caption, status_art)`)
          .eq('client_id', client.id)
          .eq('archived', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('calendars')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', client.id)
          .eq('archived', true),
        showArchivedCals
          ? supabase
              .from('calendars')
              .select(`*, posts(id, fase, status_copy, status_caption, status_art)`)
              .eq('client_id', client.id)
              .eq('archived', true)
              .order('archived_at', { ascending: false })
          : Promise.resolve({ data: null }),
      ])

      const enrich = (cals: ({ posts?: Pick<Post, 'id' | 'fase' | 'status_copy' | 'status_caption' | 'status_art'>[] } & Record<string, unknown>)[]) =>
        cals.map((cal) => {
          const posts = cal.posts ?? []
          return { ...cal, total_posts: posts.length, done: posts.filter((p) => postCompleto(p as Post)).length } as CalendarWithStats
        })

      return {
        ...client,
        calendars: enrich(activeRes.data ?? []),
        archivedCalCount: archivedCountRes.count ?? 0,
        archivedCals: archivedCalsRes.data ? enrich(archivedCalsRes.data) : null,
      }
    })
  )

  // Conta clientes arquivados para toggle global
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900">
            {showArchived ? 'Clientes arquivados' : 'Clientes'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {clientsWithData.length} cliente{clientsWithData.length !== 1 ? 's' : ''}
            {showArchived ? ' arquivado' : ' ativo'}{clientsWithData.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
        {clientsWithData.map((client) => {
          const showArchivedCals = cal_arq === client.id
          return (
            <div
              key={client.id}
              className={`bg-white rounded-xl border p-5 ${client.archived ? 'border-gray-200 opacity-80' : 'border-gray-100'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-wrap">
                  <h2 className="font-semibold text-gray-900 text-lg truncate">{client.name}</h2>
                  {client.archived && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">Arquivado</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {!client.archived && (
                    <Link
                      href={`/agencia/clientes/${client.id}/novo-calendario`}
                      className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      + Calendário
                    </Link>
                  )}
                  <ClientActions client={client} />
                </div>
              </div>

              {/* Calendários ativos */}
              {client.calendars.length === 0 && !showArchivedCals && (
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

              {/* Toggle e lista de calendários arquivados */}
              {client.archivedCalCount > 0 && (
                <div className="mt-3">
                  {showArchivedCals ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Calendários arquivados
                        </span>
                        <Link
                          href={arquivados === '1' ? '/agencia?arquivados=1' : '/agencia'}
                          className="text-xs text-gray-400 hover:text-black"
                        >
                          Ocultar
                        </Link>
                      </div>
                      <div className="space-y-2">
                        {(client.archivedCals ?? []).map((cal) => (
                          <div
                            key={cal.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-dashed border-gray-200"
                          >
                            <Link
                              href={`/agencia/calendarios/${cal.id}`}
                              className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-70 transition-opacity"
                            >
                              <StatusBadge status={cal.status} />
                              <span className="text-sm font-medium text-gray-600 truncate">
                                {cal.title}
                              </span>
                              {cal.reference_month && (
                                <span className="text-xs text-gray-400 shrink-0">{cal.reference_month}</span>
                              )}
                            </Link>
                            <div className="flex items-center gap-3 ml-3 shrink-0">
                              <span className="text-xs text-gray-400">
                                {cal.total_posts > 0 ? `${cal.total_posts} post${cal.total_posts !== 1 ? 's' : ''}` : 'Sem posts'}
                              </span>
                              <UnarchiveCalendarButton calendarId={cal.id} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={`${arquivados === '1' ? '/agencia?arquivados=1&' : '/agencia?'}cal_arq=${client.id}`}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-black transition-colors mt-1"
                    >
                      <span>Ver calendários arquivados ({client.archivedCalCount})</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
