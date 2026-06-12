'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Post, ApprovalAction } from '@/lib/types'
import { submitApprovalAction } from '@/app/actions/approvals'
import StatusBadge from '@/components/StatusBadge'
import ImageLightbox from '@/components/ImageLightbox'

const actionConfig: Record<ApprovalAction, { label: string; cls: string; activeCls: string }> = {
  aprovado:  { label: 'Aprovado',  cls: 'border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700 hover:bg-green-50',  activeCls: 'border-green-500 bg-green-50 text-green-700 font-semibold' },
  reprovado: { label: 'Reprovado', cls: 'border-gray-200 text-gray-700 hover:border-red-400 hover:text-red-700 hover:bg-red-50',        activeCls: 'border-red-500 bg-red-50 text-red-700 font-semibold' },
  ajuste:    { label: 'Ajuste',    cls: 'border-gray-200 text-gray-700 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50', activeCls: 'border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold' },
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
  const [selectedAction, setSelectedAction] = useState<ApprovalAction | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(post.status === 'pendente')
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const isAjuste = selectedAction === 'ajuste'
  const canSubmit = selectedAction && (!isAjuste || comment.trim().length > 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)

    const fd = new FormData()
    fd.append('post_id', post.id)
    fd.append('calendar_id', calendarId)
    fd.append('action', selectedAction!)
    if (isAjuste) fd.append('comment', comment.trim())

    const result = await submitApprovalAction(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setExpanded(false)
      setLoading(false)
    }
  }

  const statusColor: Record<string, string> = {
    aprovado:  'border-l-green-400',
    reprovado: 'border-l-red-400',
    ajuste:    'border-l-yellow-400',
    pendente:  'border-l-gray-200',
  }

  return (
    <>
      <div className={`bg-white rounded-xl border border-gray-100 border-l-4 ${statusColor[post.status]} overflow-hidden`}>
        {/* Cabeçalho */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">Post #{index + 1}</span>
            <div className="flex items-center gap-2">
              <StatusBadge status={post.status} />
              {post.status !== 'pendente' && !disabled && (
                <button
                  onClick={() => { setExpanded((v) => !v); setSelectedAction(null); setComment('') }}
                  className="text-xs text-gray-400 hover:text-gray-700 underline"
                >
                  {expanded ? 'Fechar' : 'Alterar resposta'}
                </button>
              )}
            </div>
          </div>

          {/* Imagem + legenda */}
          <div className="sm:flex sm:gap-4">
            {post.image_url && (
              <div className="mb-3 sm:mb-0 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="block group relative w-full sm:w-48 sm:h-48 rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                  aria-label="Ampliar imagem"
                >
                  <Image
                    src={post.image_url}
                    alt={`Post ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full sm:w-48 sm:h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2 py-1 rounded">
                      Ampliar
                    </span>
                  </div>
                </button>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {post.post_type && (
                <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mb-2">
                  {post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1)}
                </span>
              )}
              {post.scheduled_date && (
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(post.scheduled_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              )}
              {post.caption ? (
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{post.caption}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Sem legenda</p>
              )}
            </div>
          </div>
        </div>

        {/* Área de avaliação */}
        {!disabled && (post.status === 'pendente' || expanded) && (
          <div className="border-t border-gray-100 bg-gray-50 p-4">
            <form onSubmit={handleSubmit}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                {post.status === 'pendente' ? 'Avaliar este post' : 'Alterar avaliação'}
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
                    required
                    className="input resize-none text-sm"
                    placeholder="Ex.: Alterar a cor do texto para branco, ajustar o horário para 18h…"
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

        {disabled && post.status !== 'aprovado' && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-400">Este calendário está concluído e não aceita mais alterações.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && post.image_url && (
        <ImageLightbox
          src={post.image_url}
          alt={`Post ${index + 1}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
