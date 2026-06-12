'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ApprovalAction } from '@/lib/types'

export async function submitApprovalAction(formData: FormData) {
  const supabase = await createClient()

  const postId = formData.get('post_id') as string
  const calendarId = formData.get('calendar_id') as string
  const action = formData.get('action') as ApprovalAction
  const comment = (formData.get('comment') as string | null)?.trim() ?? ''

  if (!postId || !calendarId || !action) return { error: 'Dados inválidos.' }

  if (action === 'ajuste' && !comment) {
    return { error: 'Descreva o ajuste necessário antes de enviar.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  // Verifica que o post pertence a um calendário do próprio cliente (RLS garante, mas dupla checagem)
  const { data: post } = await supabase
    .from('posts')
    .select('id, calendar_id')
    .eq('id', postId)
    .single()

  if (!post) return { error: 'Post não encontrado.' }

  // Insere no histórico
  const { error: histErr } = await supabase.from('approval_history').insert({
    post_id: postId,
    action,
    comment: action === 'ajuste' ? comment : null,
    responded_by: user.id,
  })

  if (histErr) return { error: histErr.message }

  // Atualiza status do post
  const { error: postErr } = await supabase
    .from('posts')
    .update({ status: action })
    .eq('id', postId)

  if (postErr) return { error: postErr.message }

  revalidatePath(`/cliente/calendarios/${calendarId}`)
  return { success: true }
}
