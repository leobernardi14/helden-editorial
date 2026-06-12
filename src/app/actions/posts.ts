'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createPostAction(formData: FormData) {
  const supabase = await createClient()
  const calendarId = formData.get('calendar_id') as string
  const caption = (formData.get('caption') as string | null) ?? ''
  const postType = (formData.get('post_type') as string | null) || null
  const scheduledDate = (formData.get('scheduled_date') as string | null) || null
  const imageFile = formData.get('image') as File | null

  if (!calendarId) return { error: 'Calendário não encontrado.' }

  // Determina a próxima posição
  const { data: existing } = await supabase
    .from('posts')
    .select('position')
    .eq('calendar_id', calendarId)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = existing ? existing.position + 1 : 0

  let imageUrl: string | null = null

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `${calendarId}/${Date.now()}.${ext}`
    const bytes = await imageFile.arrayBuffer()

    const { error: uploadErr } = await supabase.storage
      .from('post-images')
      .upload(path, bytes, { contentType: imageFile.type, upsert: false })

    if (uploadErr) return { error: `Erro no upload: ${uploadErr.message}` }

    const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path)
    imageUrl = urlData.publicUrl
  }

  const { error } = await supabase.from('posts').insert({
    calendar_id: calendarId,
    position,
    image_url: imageUrl,
    caption: caption || null,
    post_type: postType,
    scheduled_date: scheduledDate,
  })

  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

export async function updatePostAction(formData: FormData) {
  const supabase = await createClient()
  const postId = formData.get('post_id') as string
  const calendarId = formData.get('calendar_id') as string
  const caption = (formData.get('caption') as string | null) ?? ''
  const postType = (formData.get('post_type') as string | null) || null
  const scheduledDate = (formData.get('scheduled_date') as string | null) || null
  const imageFile = formData.get('image') as File | null

  if (!postId || !calendarId) return { error: 'Dados inválidos.' }

  const updates: Record<string, unknown> = {
    caption: caption || null,
    post_type: postType,
    scheduled_date: scheduledDate,
    status: 'pendente', // volta para pendente ao editar
  }

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `${calendarId}/${Date.now()}.${ext}`
    const bytes = await imageFile.arrayBuffer()

    const { error: uploadErr } = await supabase.storage
      .from('post-images')
      .upload(path, bytes, { contentType: imageFile.type, upsert: false })

    if (uploadErr) return { error: `Erro no upload: ${uploadErr.message}` }

    const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path)
    updates.image_url = urlData.publicUrl
  }

  const { error } = await supabase.from('posts').update(updates).eq('id', postId)
  if (error) return { error: error.message }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  return { success: true }
}

export async function reorderPostsAction(calendarId: string, orderedIds: string[]) {
  const supabase = await createClient()

  const updates = orderedIds.map((id, index) =>
    supabase.from('posts').update({ position: index }).eq('id', id)
  )

  await Promise.all(updates)
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
