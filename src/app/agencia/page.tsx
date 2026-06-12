import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { CalendarWithStats, Client } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import NewClientButton from './clientes/NewClientButton'

export default async function AgenciaDashboard() {
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  // Para cada cliente, busca os calendários com contagens de status dos posts
  const clientsWithData = await Promise.all(
    (clients ?? []).map(async (client: Client) => {
      const { data: calendars } = await supabase
        .from('calendars')
        .select(`
          *,
          posts(status)
        `)
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })

      const enriched = (calendars ?? []).map((cal: { posts?: { status: string }[] } & Record<string, unknown>) => {
        const posts = cal.posts ?? []
        return {
          ...cal,
          total_posts: posts.length,
          approved: posts.filter((p) => p.status === 'aprovado').length,
          reproved: posts.filter((p) => p.status === 'reprovado').length,
          adjustment: posts.filter((p) => p.status === 'ajuste').length,
          pending: posts.filter((p) => p.status === 'pendente').length,
        } as CalendarWithStats
      })

      return { ...client, calendars: enriched }
    })
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 text-sm mt-0.5">{clientsWithData.length} cliente{clientsWithData.length !== 1 ? 's' : ''} cadastrado{clientsWithData.length !== 1 ? 's' : ''}</p>
        </div>
        <NewClientButton />
      </div>

      {clientsWithData.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">Nenhum cliente ainda</p>
          <p className="text-sm mt-1">Clique em "Novo cliente" para começar.</p>
        </div>
      )}

      <div className="space-y-4">
        {clientsWithData.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 text-lg">{client.name}</h2>
              <Link
                href={`/agencia/clientes/${client.id}/novo-calendario`}
                className="text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                + Calendário
              </Link>
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
                        <span className="text-green-600 font-medium">{cal.approved} ✓</span>
                        {cal.adjustment > 0 && <span className="text-yellow-600 font-medium">{cal.adjustment} ajuste{cal.adjustment > 1 ? 's' : ''}</span>}
                        {cal.reproved > 0 && <span className="text-red-600 font-medium">{cal.reproved} reprov.</span>}
                        {cal.pending > 0 && <span className="text-gray-400">{cal.pending} pend.</span>}
                        <span className="text-gray-300">|</span>
                        <span>{cal.total_posts} posts</span>
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
