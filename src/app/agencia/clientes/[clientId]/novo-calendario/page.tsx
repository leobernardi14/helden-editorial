import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NovoCalendarioForm from './NovoCalendarioForm'

export default async function NovoCalendarioPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', clientId)
    .single()

  if (!client) notFound()

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/agencia" className="text-sm text-gray-500 hover:text-black">← Voltar</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Novo calendário</h1>
        <p className="text-gray-500 text-sm">
          Cliente: <span className="font-medium text-gray-700">{client.name}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <NovoCalendarioForm clientId={clientId} cancelHref="/agencia" />
      </div>
    </div>
  )
}
