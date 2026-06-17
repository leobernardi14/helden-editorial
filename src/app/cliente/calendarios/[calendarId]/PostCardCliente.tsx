'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Post, ApprovalAction, ApprovalPart, PostStatus } from '@/lib/types'
import { submitApprovalAction } from '@/app/actions/approvals'
import StatusBadge from '@/components/StatusBadge'
import ImageLightbox from '@/components/ImageLightbox'
import ExpandableCaption from '@/components/ExpandableCaption'

const actionConfig: Record<ApprovalAction, { label: string; cls: string; activeCls: string }> = {
  aprovado:  { label: 'Aprovado',  cls: 'border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 hover:bg-green-50',  activeCls: 'border-green-500 bg-green-50 text-green-700 font-semibold' },
  reprovado: { label: 'Reprovado', cls: 'border-gray-200 text-gray-700 hover:border-red-400 hover:text-red-700 hover:bg-red-50',        activeCls: 'border-red-500 bg-red-50 text-red-700 font-semibold' },
  ajuste:    { label: 'Ajuste',    cls: 'border-gray-200 text-gray-700 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50', activeCls: 'border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold' },
}

function ApprovalBlock({
  postId, calendarId, part, label, text, currentStatus, disabled,
}: {
  postId: string
  calendarId: string
  part: ApprovalPart
  label: string
  text: string
  currentStatus: PostStatus
  disabled: boolean
}) {
  const isPendente = currentStatus === 'pendente'
  const [expanded, setExpanded]           = useState(isPendente)
  const [selectedAction, setSelectedAction] = useState<ApprovalAction | null>(null)
  const [comment, setComment]             = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const isAjuste  = selectedAction === 'ajuste'
  const canSubmit = selectedAction && (!isAjuste || comment.trim().length > 0)

  const borderColor: Record<PostStatus, string> = {
    pendente: 'border-gray-200', aprovado: 'border-green-200',
    reprovado: 'border-red-200', ajuste: 'border-yellow-200',
  }
  const bgColor: Record<PostStatus, string> = {
    pendente: 'bg-gray-50', aprovado: 'bg-green-50/40',
    reprovado: 'bg-red-50/40', ajuste: 'bg-yellow-50/40',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    const fd = new FormData()
    fd.append('post_id', postId)
    fd.append('calendar_id', calendarId)
    fd.append('part', part)
    fd.append('action', selectedAction!)
    if (isAjuste) fd.append('comment', comment.trim())
    const result = await submitApprovalAction(fd)
    if (result?.error) { setError(result.error); setLoading(false) }
    else { setExpanded(false); setSelectedAction(null); setComment(''); setLoading(false) }
  }

  const partColor =
    part === 'copy'    ? 'text-blue-700' :
    part === 'caption' ? 'text-purple-700' :
                         'text-orange-700'

  return (
    <div className={`rounded-xl border ${borderColor[currentStatus]} overflow-hidden`}>
      <div className={`px-4 py-3 ${bgColor[currentStatus]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wide ${partColor}`}>{label}</span>
            <StatusBadge status={currentStatus} />
          </div>
          {!isPendente && !disabled && (
            <button
              type="button"
              onClick={() => { setExpanded((v) => !v); setSelectedAction(null); setComment('') }}
              className="text-xs text-gray-400 hover:text-gray-700 underline"
            >
              {expanded ? 'Fechar' : 'Alterar resposta'}
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <ExpandableCaption text={text} />
      </div>

      {!disabled && (isPendente || expanded) && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <form onSubmit={handleSubmit}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              {isPendente ? `Avaliar: ${label}` : `Alterar avaliação: ${label}`}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(Object.keys(actionConfig) as ApprovalAction[]).map((action) => {
                const cfg = actionConfig[action]
                const isSelected = selectedAction === action
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => { setSelectedAction(action); setComment('') }}
                    className={`py-2.5 rounded-lg border text-sm transition-all ${isSelected ? cfg.activeCls : cfg.cls}`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
            {isAjuste && (
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Descreva o ajuste necessário <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="input resize-none text-sm"
                  placeholder={
                    part === 'copy'    ? 'Ex.: Alterar a cor do texto, corrigir a palavra…' :
                    part === 'caption' ? 'Ex.: Alterar o horário para 18h, adicionar hashtags…' :
                                        'Ex.: A arte ficou muito escura, ajustar o contraste…'
                  }
                />
                {comment.trim().length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">Campo obrigatório para enviar ajuste.</p>
                )}
              </div>
            )}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{error}</p>
            )}
            {selectedAction && (
              <button
                type="submit"
                disabled={loading || !canSubmit}
                className="w-full bg-black text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Enviando…' : `Confirmar: ${actionConfig[selectedAction].label}`}
              </button>
            )}
          </form>
        </div>
      )}

      {disabled && currentStatus === 'pendente' && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-400">Calendário concluído — sem alterações.</p>
        </div>
      )}
    </div>
  )
}

function cardBorderColor(post: Post): string {
  const statuses = [post.status_copy, post.status_caption]
  if (post.fase === 'arte') statuses.push(post.status_art)
  if (statuses.includes('reprovado')) return 'border-l-red-400'
  if (statuses.includes('ajuste'))    return 'border-l-yellow-400'
  if (statuses.every((s) => s === 'aprovado')) return 'border-l-green-400'
  return 'border-l-gray-200'
}

export default function PostCardCliente({
  post,
  index,
  calendarId,
  disabled,
}: {
  post: Post
  index: number
  calendarId: string
  disabled: boolean
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <>
      <div className={`bg-white rounded-xl border border-gray-100 border-l-4 ${cardBorderColor(post)} overflow-hidden`}>
        {/* Cabeçalho */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs font-medium text-gray-400">Post #{index + 1}</span>
            {post.post_type && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
              </span>
            )}
            {post.scheduled_date && (
              <span className="text-xs text-gray-400">
                {new Date(post.scheduled_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            )}
          </div>

          {/* Arte: imagem real ou placeholder — ambas clicáveis */}
          {(() => {
            const isReal = post.fase === 'arte' && !!post.image_url
            const src    = isReal ? post.image_url! : '/arte-em-desenvolvimento.png'
            const alt    = isReal ? `Post ${index + 1}` : 'Arte em desenvolvimento'
            return (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group block relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  aria-label="Ampliar imagem"
                >
                  {/*
                    overflow+borderRadius inline no wrapper garante o clip mesmo
                    quando o card pai tem overflow:hidden — independe de classe Tailwind
                  */}
                  <div style={{ width: 224, height: 224, borderRadius: '0.75rem', overflow: 'hidden', background: '#f9fafb' }}>
                    <Image
                      src={src}
                      alt={alt}
                      width={224}
                      height={224}
                      className="w-full h-full object-contain transition-opacity duration-200 group-hover:opacity-90"
                    />
                  </div>
                  {/* Dica visual de lupa */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                      </svg>
                      Ampliar
                    </span>
                  </div>
                </button>
                {!isReal && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {post.status_copy === 'aprovado' && post.status_caption === 'aprovado'
                      ? 'Copys aprovadas! A arte será enviada para sua aprovação em breve.'
                      : 'Aprove as copys abaixo para que nossa equipe inicie a arte.'
                    }
                  </p>
                )}
              </div>
            )
          })()}
        </div>

        {/* Bloco Copy da arte */}
        <div className="px-4 pb-3">
          <ApprovalBlock
            postId={post.id}
            calendarId={calendarId}
            part="copy"
            label="Copy da arte"
            text={post.copy_text || '—'}
            currentStatus={post.status_copy}
            disabled={disabled}
          />
        </div>

        {/* Bloco Legenda */}
        <div className="px-4 pb-3">
          <ApprovalBlock
            postId={post.id}
            calendarId={calendarId}
            part="caption"
            label="Legenda"
            text={post.caption || '—'}
            currentStatus={post.status_caption}
            disabled={disabled}
          />
        </div>

        {/* Bloco Arte — só na fase 'arte' */}
        {post.fase === 'arte' && (
          <div className="px-4 pb-4">
            <ApprovalBlock
              postId={post.id}
              calendarId={calendarId}
              part="art"
              label="Arte"
              text="Avalie a imagem da arte acima."
              currentStatus={post.status_art}
              disabled={disabled}
            />
          </div>
        )}

      </div>

      {lightboxOpen && (
        <ImageLightbox
          src={(post.fase === 'arte' && post.image_url) ? post.image_url : '/arte-em-desenvolvimento.png'}
          alt={(post.fase === 'arte' && post.image_url) ? `Post ${index + 1}` : 'Arte em desenvolvimento'}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
