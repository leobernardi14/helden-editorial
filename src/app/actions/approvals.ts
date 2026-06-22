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
  if (!['copy', 'caption', 'art'].includes(part)) return { error: 'Parte inválida.' }

  if (action === 'ajuste' && !comment) {
    return { error: 'Descreva o ajuste necessário antes de enviar.' }
  }
  if (action === 'reprovado' && !comment) {
    return { error: 'Descreva o motivo da reprovação antes de enviar.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: post } = await supabase
    .from('posts')
    .select('id, calendar_id')
    .eq('id', postId)
    .single()

  if (!post) return { error: 'Post não encontrado ou sem permissão de acesso.' }

  const { error: histErr } = await supabase.from('approval_history').insert({
    post_id: postId,
    part,
    action,
    comment: (action === 'ajuste' || action === 'reprovado') ? comment : null,
    responded_by: user.id,
  })

  if (histErr) return { error: `Erro ao gravar histórico: ${histErr.message}` }

  const statusField =
    part === 'copy'    ? 'status_copy' :
    part === 'caption' ? 'status_caption' :
                         'status_art'

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

// Agência aprova internamente uma parte que estava em "ajuste" (cliente pediu ajuste
// e a agência já corrigiu) — evita devolver ao cliente para reaprovar um ajuste que ele mesmo pediu.
export async function approveInternallyAction(postId: string, calendarId: string, part: ApprovalPart) {
  const supabase = await createClient()

  if (!['copy', 'caption', 'art'].includes(part)) return { error: 'Parte inválida.' }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'agencia') return { error: 'Acesso negado.' }

  const statusField =
    part === 'copy'    ? 'status_copy' :
    part === 'caption' ? 'status_caption' :
                         'status_art'

  const { data: post } = await supabase
    .from('posts')
    .select(`id, ${statusField}`)
    .eq('id', postId)
    .single()

  if (!post) return { error: 'Post não encontrado.' }

  const currentStatus = (post as unknown as Record<string, string>)[statusField]
  if (currentStatus !== 'ajuste') {
    return { error: 'Só é possível aprovar internamente uma parte que esteja em "Ajuste".' }
  }

  // Busca o ajuste mais recente do cliente para essa parte, para referenciar no histórico
  const { data: lastAjuste } = await supabase
    .from('approval_history')
    .select('comment')
    .eq('post_id', postId)
    .eq('part', part)
    .eq('action', 'ajuste')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const refComment = lastAjuste?.comment
    ? `Ajuste original do cliente: "${lastAjuste.comment}"`
    : null

  const { error: histErr } = await supabase.from('approval_history').insert({
    post_id: postId,
    part,
    action: 'aprovado_interno',
    comment: refComment,
    responded_by: user.id,
  })

  if (histErr) return { error: `Erro ao gravar histórico: ${histErr.message}` }

  const { error: postErr } = await supabase
    .from('posts')
    .update({ [statusField]: 'aprovado' })
    .eq('id', postId)

  if (postErr) return { error: `Erro ao atualizar status: ${postErr.message}` }

  revalidatePath(`/agencia/calendarios/${calendarId}`)
  revalidatePath(`/cliente/calendarios/${calendarId}`)
  return { success: true }
}
