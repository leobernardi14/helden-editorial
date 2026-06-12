import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { createCalendarAction } from '@/app/actions/calendars'
import Link from 'next/link'

async function createCalendar(fd: FormData) {
  'use server'
  await createCalendarAction(fd)
}

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
        <p className="text-gray-500 text-sm">Cliente: <span className="font-medium text-gray-700">{client.name}</span></p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <form action={createCalendar} className="space-y-4">
          <input type="hidden" name="client_id" value={clientId} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input name="title" required className="input" placeholder="Ex.: Calendário Editorial — Junho/2026" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mês de referência</label>
            <input name="reference_month" type="month" className="input" />
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/agencia" className="flex-1 text-center text-sm text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors">
              Cancelar
            </Link>
            <button type="submit" className="flex-1 bg-black text-white text-sm font-medium rounded-lg py-2.5 hover:bg-gray-800 transition-colors">
              Criar calendário
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
