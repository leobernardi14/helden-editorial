'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function verifyAgencia(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return data?.role === 'agencia'
}

export async function createCalendarAction(formData: FormData) {
  const supabase = await createClient()
  const clientId = formData.get('client_id') as string
  const title = (formData.get('title') as string).trim()
  const referenceMonth = (formData.get('reference_month') as string | null)?.trim() || null

  if (!clientId || !title) return { error: 'Preencha o título do calendário.' }

  const { data, error } = await supabase
    .from('calendars')
    .insert({
      client_id: clientId,
      title,
      reference_month: referenceMonth,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/agencia')
  redirect(`/agencia/calendarios/${data.id}`)
}

export async function updateCalendarAction(formData: FormData) {
  const supabase = await createClient()
  if (!(await verifyAgencia(supabase))) return { error: 'Acesso negado.' }

  const id = formData.get('id') as string
  const title = (formData.get('title') as string).trim()
  const referenceMonth = formData.get('reference_month') as string | null

  if (!id || !title) return { error: 'Dados inválidos.' }

  const { error } = await supabase
    .from('calendars')
    .update({ title, reference_month: referenceMonth || null })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${id}`)
  revalidatePath('/agencia')
  return { success: true }
}

export async function archiveCalendarAction(calendarId: string) {
  const supabase = await createClient()
  if (!(await verifyAgencia(supabase))) return { error: 'Acesso negado.' }

  const { error } = await supabase
    .from('calendars')
    .update({ archived: true, archived_at: new Date().toISOString() })
    .eq('id', calendarId)

  if (error) return { error: error.message }

  revalidatePath('/agencia')
  return { success: true }
}

export async function unarchiveCalendarAction(calendarId: string) {
  const supabase = await createClient()
  if (!(await verifyAgencia(supabase))) return { error: 'Acesso negado.' }

  const { error } = await supabase
    .from('calendars')
    .update({ archived: false, archived_at: null })
    .eq('id', calendarId)

  if (error) return { error: error.message }

  revalidatePath('/agencia')
  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

export async function releaseCalendarAction(calendarId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('calendars')
    .update({ status: 'enviado' })
    .eq('id', calendarId)
    .eq('status', 'rascunho')

  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  revalidatePath('/agencia')
  return { success: true }
}

export async function concludeCalendarAction(calendarId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('calendars')
    .update({ status: 'concluido' })
    .eq('id', calendarId)

  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  revalidatePath('/agencia')
  return { success: true }
}
