'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ApprovalAction, ApprovalPart } from '@/lib/types'

export async function submitApprovalAction(formData: FormData) {
  const supabase = await createClient()

  const postId     = formData.get('post_id') as string
  const calendarId = formData.get('calendar_id') as string
  const part       = formData.get('part') as ApprovalPart
  const action     = formData.get('action') as ApprovalAction
  const comment    = (formData.get('comment') as string | null)?.trim() ?? ''

  if (!postId || !calendarId || !part || !action) return { error: 'Dados inválidos.' }
  if (!['copy', 'caption'].includes(part)) return { error: 'Parte inválida.' }

  if (action === 'ajuste' && !comment) {
    return { error: 'Descreva o ajuste necessário antes de enviar.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: post } = await supabase
    .from('posts')
    .select('id, calendar_id')
    .eq('id', postId)
    .single()

  if (!post) return { error: 'Post não encontrado ou sem permissão de acesso.' }

  // Insere no histórico com a parte referenciada
  const { error: histErr } = await supabase.from('approval_history').insert({
    post_id: postId,
    part,
    action,
    comment: action === 'ajuste' ? comment : null,
    responded_by: user.id,
  })

  if (histErr) return { error: `Erro ao gravar histórico: ${histErr.message}` }

  // Atualiza o status da parte correspondente
  const statusField = part === 'copy' ? 'status_copy' : 'status_caption'

  const { data: updated, error: postErr } = await supabase
    .from('posts')
    .update({ [statusField]: action })
    .eq('id', postId)
    .select('id')

  if (postErr) return { error: `Erro ao atualizar status: ${postErr.message}` }

  if (!updated || updated.length === 0) {
    return { error: 'Sem permissão para atualizar este post. Verifique as políticas de acesso.' }
  }

  revalidatePath(`/cliente/calendarios/${calendarId}`)
  return { success: true }
}
