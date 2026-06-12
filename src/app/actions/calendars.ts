'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
