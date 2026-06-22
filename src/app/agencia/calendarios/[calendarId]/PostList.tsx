'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Post, CalendarStatus, PostStatus, ApprovalPart } from '@/lib/types'
import { faseBadge, postProntoParaProgramar } from '@/lib/postProgress'
import { markPostScheduledAction, unmarkPostScheduledAction, removePostAction, unarchivePostAction } from '@/app/actions/posts'
import { approveInternallyAction } from '@/app/actions/approvals'
import StatusBadge from '@/components/StatusBadge'
import PostForm from './PostForm'
import PostHistoryModal from './PostHistoryModal'
import ImageLightbox from '@/components/ImageLightbox'
import ExpandableCaption from '@/components/ExpandableCaption'
import ReleaseArtForm from './ReleaseArtForm'

function postNeedsAction(post: Post) {
  const bad: PostStatus[] = ['reprovado', 'ajuste']
  return bad.includes(post.status_copy) || bad.includes(post.status_caption) || bad.includes(post.status_art)
}

function copysApproved(post: Post) {
  return post.status_copy === 'aprovado' && post.status_caption === 'aprovado'
}

export default function PostList({
  posts,
  archivedPosts,
  postsWithHistoryIds,
  calendarId,
  calendarStatus,
}: {
  posts: Post[]
  archivedPosts: Post[]
  postsWithHistoryIds: string[]
  calendarId: string
  calendarStatus: CalendarStatus
}) {
  const [showAddForm, setShowAddForm]     = useState(false)
  const [editingPost, setEditingPost]     = useState<Post | null>(null)
  const [historyPost, setHistoryPost]     = useState<Post | null>(null)
  const [lightboxPost, setLightboxPost]   = useState<Post | null>(null)
  const [releasingPost, setReleasingPost] = useState<Post | null>(null)
  const [schedulingId, setSchedulingId]   = useState<string | null>(null)
  const [scheduleError, setScheduleError] = useState<{ postId: string; message: string } | null>(null)
  const [removingId, setRemovingId]       = useState<string | null>(null)
  const [removeError, setRemoveError]     = useState<{ postId: string; message: string } | null>(null)
  const [showArchivedPosts, setShowArchivedPosts] = useState(false)
  const [approvingPart, setApprovingPart] = useState<{ postId: string; part: ApprovalPart } | null>(null)
  const [approveError, setApproveError]   = useState<{ postId: string; part: ApprovalPart; message: string } | null>(null)

  function postHasHistory(post: Post) {
    return postsWithHistoryIds.includes(post.id)
  }

  async function handleApproveInternally(post: Post, part: ApprovalPart) {
    const partLabel = part === 'copy' ? 'Copy da arte' : part === 'caption' ? 'Legenda' : 'Arte'
    if (!confirm(
      `Aprovar "${partLabel}" internamente pela Helden, após o ajuste já corrigido?\n\nO cliente verá que foi a agência que aprovou (não ele), de forma transparente.`
    )) return
    setApprovingPart({ postId: post.id, part })
    setApproveError(null)
    const r = await approveInternallyAction(post.id, calendarId, part)
    setApprovingPart(null)
    if (r?.error) setApproveError({ postId: post.id, part, message: r.error })
  }

  async function handleMarkScheduled(post: Post) {
    setSchedulingId(post.id)
    setScheduleError(null)
    const r = await markPostScheduledAction(post.id, calendarId)
    setSchedulingId(null)
    if (r?.error) setScheduleError({ postId: post.id, message: r.error })
  }

  async function handleUnmarkScheduled(post: Post) {
    if (!confirm('Desmarcar este post como programado?')) return
    setSchedulingId(post.id)
    setScheduleError(null)
    const r = await unmarkPostScheduledAction(post.id, calendarId)
    setSchedulingId(null)
    if (r?.error) setScheduleError({ postId: post.id, message: r.error })
  }

  async function handleRemove(post: Post) {
    const hasHistory = postHasHistory(post)
    const confirmMsg = hasHistory
      ? 'Este post já tem histórico de aprovação do cliente. Ele será ARQUIVADO (não excluído) — o histórico fica preservado e o post pode ser restaurado depois em "Ver posts arquivados". Continuar?'
      : 'Este post ainda é um rascunho sem histórico. Ele será EXCLUÍDO PERMANENTEMENTE e não poderá ser recuperado. Tem certeza?'
    if (!confirm(confirmMsg)) return
    setRemovingId(post.id)
    setRemoveError(null)
    const r = await removePostAction(post.id, calendarId)
    setRemovingId(null)
    if (r?.error) setRemoveError({ postId: post.id, message: r.error })
  }

  async function handleUnarchivePost(post: Post) {
    if (!confirm('Desarquivar este post? Ele volta para a lista principal.')) return
    setRemovingId(post.id)
    setRemoveError(null)
    const r = await unarchivePostAction(post.id, calendarId)
    setRemovingId(null)
    if (r?.error) setRemoveError({ postId: post.id, message: r.error })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Posts ({posts.length})</h2>
        <button
          onClick={() => { setShowAddForm(true); setEditingPost(null) }}
          className="text-sm bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Adicionar post
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium text-gray-900 mb-4">Novo post</h3>
          <PostForm
            calendarId={calendarId}
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {posts.length === 0 && !showAddForm && (
        <div className="text-center py-16 text-gray-400">
          <p>Nenhum post ainda. Clique em "+ Adicionar post" para começar.</p>
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post, idx) => (
          <div
            key={post.id}
            className={`bg-white rounded-xl border p-4 ${
              postNeedsAction(post) ? 'border-yellow-200' : 'border-gray-100'
            }`}
          >
            {editingPost?.id === post.id ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Editar post #{idx + 1}</h3>
                <PostForm
                  calendarId={calendarId}
                  post={post}
                  onSuccess={() => setEditingPost(null)}
                  onCancel={() => setEditingPost(null)}
                />
              </div>
            ) : releasingPost?.id === post.id ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Liberar arte — post #{idx + 1}</h3>
                <p className="text-xs text-gray-500 mb-4">Envie a imagem final da arte para liberar a aprovação pelo cliente.</p>
                <ReleaseArtForm
                  post={post}
                  calendarId={calendarId}
                  onSuccess={() => setReleasingPost(null)}
                  onCancel={() => setReleasingPost(null)}
                />
              </div>
            ) : (
              <div className="flex gap-4">
                {/* Miniatura */}
                <div className="shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  {post.image_url ? (
                    <button
                      type="button"
                      onClick={() => setLightboxPost(post)}
                      className="block w-full h-full group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg"
                      aria-label="Ampliar imagem"
                    >
                      <Image
                        src={post.image_url}
                        alt={`Post ${idx + 1}`}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 rounded-lg flex items-center justify-center">
                        <span className="text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Ampliar
                        </span>
                      </div>
                    </button>
                  ) : (
                    <Image
                      src="/arte-em-desenvolvimento.png"
                      alt="Arte em desenvolvimento"
                      width={96}
                      height={96}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  {/* Cabeçalho */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
                    {/* Fase badge */}
                    {(() => { const b = faseBadge(post); return (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.cls}`}>
                        {b.label}
                      </span>
                    ) })()}
                    {post.post_type && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        Formato: {post.post_type.toUpperCase()}
                      </span>
                    )}
                    {post.scheduled_date && (
                      <span className="text-xs text-gray-400">
                        Data da publicação: {new Date(post.scheduled_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Copy da arte */}
                    <div className="pl-3 py-1.5 border-l-[3px] border-l-blue-400">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Copy da arte</span>
                        <StatusBadge status={post.status_copy} />
                        {post.status_copy === 'ajuste' && (
                          <button
                            onClick={() => handleApproveInternally(post, 'copy')}
                            disabled={approvingPart?.postId === post.id && approvingPart.part === 'copy'}
                            className="text-xs text-emerald-700 hover:text-emerald-900 border border-emerald-200 rounded-md px-2 py-0.5 transition-colors disabled:opacity-50"
                          >
                            {approvingPart?.postId === post.id && approvingPart.part === 'copy' ? 'Aprovando…' : 'Aprovar internamente (após ajuste)'}
                          </button>
                        )}
                      </div>
                      <ExpandableCaption text={post.copy_text || '—'} />
                      {approveError?.postId === post.id && approveError.part === 'copy' && (
                        <p className="text-xs text-red-600 mt-1">{approveError.message}</p>
                      )}
                    </div>

                    {/* Legenda */}
                    <div className="pl-3 py-1.5 border-l-[3px] border-l-purple-400">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Legenda</span>
                        <StatusBadge status={post.status_caption} />
                        {post.status_caption === 'ajuste' && (
                          <button
                            onClick={() => handleApproveInternally(post, 'caption')}
                            disabled={approvingPart?.postId === post.id && approvingPart.part === 'caption'}
                            className="text-xs text-emerald-700 hover:text-emerald-900 border border-emerald-200 rounded-md px-2 py-0.5 transition-colors disabled:opacity-50"
                          >
                            {approvingPart?.postId === post.id && approvingPart.part === 'caption' ? 'Aprovando…' : 'Aprovar internamente (após ajuste)'}
                          </button>
                        )}
                      </div>
                      {post.caption
                        ? <ExpandableCaption text={post.caption} />
                        : <p className="text-sm text-gray-400 italic">Sem legenda</p>
                      }
                      {approveError?.postId === post.id && approveError.part === 'caption' && (
                        <p className="text-xs text-red-600 mt-1">{approveError.message}</p>
                      )}
                    </div>

                    {/* Arte */}
                    <div className="pl-3 py-1.5 border-l-[3px] border-l-orange-400">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Arte</span>
                        {post.fase === 'arte'
                          ? <StatusBadge status={post.status_art} />
                          : <span className="text-xs text-gray-400 italic">aguardando liberação</span>
                        }
                        {post.status_art === 'ajuste' && (
                          <button
                            onClick={() => handleApproveInternally(post, 'art')}
                            disabled={approvingPart?.postId === post.id && approvingPart.part === 'art'}
                            className="text-xs text-emerald-700 hover:text-emerald-900 border border-emerald-200 rounded-md px-2 py-0.5 transition-colors disabled:opacity-50"
                          >
                            {approvingPart?.postId === post.id && approvingPart.part === 'art' ? 'Aprovando…' : 'Aprovar internamente (após ajuste)'}
                          </button>
                        )}
                      </div>
                      {approveError?.postId === post.id && approveError.part === 'art' && (
                        <p className="text-xs text-red-600 mt-1">{approveError.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Alerta: pronto para liberar arte */}
                  {post.fase === 'copys' && copysApproved(post) && (
                    <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                      <span className="text-xs text-green-700 font-medium">✓ Copys aprovadas — pronto para liberar arte</span>
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded-md px-2 py-1 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setHistoryPost(post)}
                    className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded-md px-2 py-1 transition-colors"
                  >
                    Histórico
                  </button>
                  {/* Liberar arte: disponível quando copys aprovadas e ainda na fase copys */}
                  {post.fase === 'copys' && copysApproved(post) && (
                    <button
                      onClick={() => setReleasingPost(post)}
                      className="text-xs text-white bg-black hover:bg-gray-800 rounded-md px-2 py-1 transition-colors"
                    >
                      Liberar arte
                    </button>
                  )}
                  {/* Marcar/desmarcar como programado: disponível quando as 3 partes estão aprovadas */}
                  {postProntoParaProgramar(post) && !post.scheduled && (
                    <button
                      onClick={() => handleMarkScheduled(post)}
                      disabled={schedulingId === post.id}
                      className="text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-md px-2 py-1 transition-colors"
                    >
                      {schedulingId === post.id ? 'Marcando…' : 'Marcar como programado'}
                    </button>
                  )}
                  {post.scheduled && (
                    <button
                      onClick={() => handleUnmarkScheduled(post)}
                      disabled={schedulingId === post.id}
                      className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded-md px-2 py-1 transition-colors disabled:opacity-50"
                    >
                      {schedulingId === post.id ? 'Aguarde…' : 'Desmarcar programado'}
                    </button>
                  )}
                  {scheduleError?.postId === post.id && (
                    <p className="text-xs text-red-600 max-w-[140px] text-right">{scheduleError.message}</p>
                  )}
                  {/* Excluir (rascunho sem histórico) ou Arquivar (já tem histórico do cliente) */}
                  <button
                    onClick={() => handleRemove(post)}
                    disabled={removingId === post.id}
                    className={`text-xs rounded-md px-2 py-1 transition-colors disabled:opacity-50 border ${
                      postHasHistory(post)
                        ? 'text-gray-500 hover:text-black border-gray-200'
                        : 'text-red-600 hover:text-red-800 border-red-200'
                    }`}
                  >
                    {removingId === post.id ? 'Aguarde…' : postHasHistory(post) ? 'Arquivar' : 'Excluir'}
                  </button>
                  {removeError?.postId === post.id && (
                    <p className="text-xs text-red-600 max-w-[140px] text-right">{removeError.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Posts arquivados (já tiveram histórico do cliente; excluídos da lista principal) */}
      {archivedPosts.length > 0 && (
        <div className="mt-6">
          {showArchivedPosts ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Posts arquivados ({archivedPosts.length})
                </h3>
                <button
                  onClick={() => setShowArchivedPosts(false)}
                  className="text-xs text-gray-400 hover:text-black transition-colors"
                >
                  Ocultar
                </button>
              </div>
              <div className="space-y-2">
                {archivedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-dashed border-gray-200"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {(() => { const b = faseBadge(post); return (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${b.cls}`}>
                          {b.label}
                        </span>
                      ) })()}
                      <span className="text-sm text-gray-600 truncate">
                        {post.copy_text || 'Sem copy'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <button
                        onClick={() => setHistoryPost(post)}
                        className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded-md px-2 py-1 transition-colors"
                      >
                        Histórico
                      </button>
                      <button
                        onClick={() => handleUnarchivePost(post)}
                        disabled={removingId === post.id}
                        className="text-xs text-gray-500 hover:text-black border border-gray-200 rounded-md px-2 py-1 transition-colors disabled:opacity-50"
                      >
                        {removingId === post.id ? '…' : 'Desarquivar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {removeError && !posts.some((p) => p.id === removeError.postId) && (
                <p className="text-xs text-red-600 mt-2">{removeError.message}</p>
              )}
            </>
          ) : (
            <button
              onClick={() => setShowArchivedPosts(true)}
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              Ver posts arquivados ({archivedPosts.length}) →
            </button>
          )}
        </div>
      )}

      {historyPost && (
        <PostHistoryModal post={historyPost} onClose={() => setHistoryPost(null)} />
      )}

      {lightboxPost?.image_url && (
        <ImageLightbox
          src={lightboxPost.image_url}
          alt={`Post ${posts.indexOf(lightboxPost) + 1}`}
          onClose={() => setLightboxPost(null)}
        />
      )}
    </div>
  )
}
