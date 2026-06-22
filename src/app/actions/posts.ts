'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function verifyAgencia(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return data?.role === 'agencia'
}

export async function createPostAction(formData: FormData) {
  const supabase = await createClient()
  const calendarId    = formData.get('calendar_id') as string
  const copyText      = (formData.get('copy_text') as string | null)?.trim() ?? ''
  const caption       = (formData.get('caption') as string | null)?.trim() ?? ''
  const postType      = (formData.get('post_type') as string | null) || null
  const scheduledDate = (formData.get('scheduled_date') as string | null) || null
  const imageUrl      = (formData.get('image_url') as string | null) || null

  if (!calendarId) return { error: 'Calendário não encontrado.' }
  if (!copyText)   return { error: 'O campo "Copy da arte" é obrigatório.' }
  if (!caption)    return { error: 'O campo "Legenda" é obrigatório.' }

  const { data: existing } = await supabase
    .from('posts')
    .select('position')
    .eq('calendar_id', calendarId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = existing ? existing.position + 1 : 0

  const { error } = await supabase.from('posts').insert({
    calendar_id: calendarId,
    position,
    image_url: imageUrl,
    copy_text: copyText,
    caption,
    post_type: postType,
    scheduled_date: scheduledDate,
    fase: 'copys',
    status_copy: 'pendente',
    status_caption: 'pendente',
    status_art: 'pendente',
  })

  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

export async function updatePostAction(formData: FormData) {
  const supabase = await createClient()
  const postId        = formData.get('post_id') as string
  const calendarId    = formData.get('calendar_id') as string
  const copyText      = (formData.get('copy_text') as string | null)?.trim() ?? ''
  const caption       = (formData.get('caption') as string | null)?.trim() ?? ''
  const postType      = (formData.get('post_type') as string | null) || null
  const scheduledDate = (formData.get('scheduled_date') as string | null) || null
  const imageUrl      = (formData.get('image_url') as string | null) || null

  if (!postId || !calendarId) return { error: 'Dados inválidos.' }
  if (!copyText) return { error: 'O campo "Copy da arte" é obrigatório.' }
  if (!caption)  return { error: 'O campo "Legenda" é obrigatório.' }

  const updates: Record<string, unknown> = {
    copy_text: copyText,
    caption,
    post_type: postType,
    scheduled_date: scheduledDate,
    // Editar textos reseta copys para pendente; fase e status_art permanecem
    status_copy: 'pendente',
    status_caption: 'pendente',
  }

  if (imageUrl) updates.image_url = imageUrl

  const { error } = await supabase.from('posts').update(updates).eq('id', postId)
  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

// Agência libera a arte: sobe a imagem (já feita no client) e muda fase para 'arte'
export async function releaseArtAction(formData: FormData) {
  const supabase = await createClient()
  const postId     = formData.get('post_id') as string
  const calendarId = formData.get('calendar_id') as string
  const imageUrl   = (formData.get('image_url') as string | null) || null

  if (!postId || !calendarId) return { error: 'Dados inválidos.' }
  if (!imageUrl) return { error: 'Envie a imagem da arte antes de liberar.' }

  const { error } = await supabase
    .from('posts')
    .update({ image_url: imageUrl, fase: 'arte', status_art: 'pendente' })
    .eq('id', postId)

  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

// Marca um post (já liberado para programar, 3 partes aprovadas) como agendado pela agência
export async function markPostScheduledAction(postId: string, calendarId: string) {
  const supabase = await createClient()
  if (!(await verifyAgencia(supabase))) return { error: 'Acesso negado.' }

  const { error } = await supabase
    .from('posts')
    .update({ scheduled: true, scheduled_at: new Date().toISOString() })
    .eq('id', postId)

  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

// Reverte a marcação de "programado", caso a agência tenha marcado por engano
export async function unmarkPostScheduledAction(postId: string, calendarId: string) {
  const supabase = await createClient()
  if (!(await verifyAgencia(supabase))) return { error: 'Acesso negado.' }

  const { error } = await supabase
    .from('posts')
    .update({ scheduled: false, scheduled_at: null })
    .eq('id', postId)

  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

export async function reorderPostsAction(calendarId: string, orderedIds: string[]) {
  const supabase = await createClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('posts').update({ position: index }).eq('id', id)
    )
  )
  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

export async function deletePostAction(postId: string, calendarId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) return { error: error.message }
  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}
