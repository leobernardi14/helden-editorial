'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Post, CalendarStatus, PostStatus } from '@/lib/types'
import { faseBadge } from '@/lib/postProgress'
import StatusBadge from '@/components/StatusBadge'
import PostForm from './PostForm'
import PostHistoryModal from './PostHistoryModal'
import ImageLightbox from '@/components/ImageLightbox'
import ExpandableCaption from '@/components/ExpandableCaption'
import ReleaseArtForm from './ReleaseArtForm'

const postTypeLabels: Record<string, string> = {
  feed: 'Feed', story: 'Story', reels: 'Reels', carrossel: 'Carrossel',
}

function postNeedsAction(post: Post) {
  const bad: PostStatus[] = ['reprovado', 'ajuste']
  return bad.includes(post.status_copy) || bad.includes(post.status_caption) || bad.includes(post.status_art)
}

function copysApproved(post: Post) {
  return post.status_copy === 'aprovado' && post.status_caption === 'aprovado'
}

export default function PostList({
  posts,
  calendarId,
  calendarStatus,
}: {
  posts: Post[]
  calendarId: string
  calendarStatus: CalendarStatus
}) {
  const [showAddForm, setShowAddForm]     = useState(false)
  const [editingPost, setEditingPost]     = useState<Post | null>(null)
  const [historyPost, setHistoryPost]     = useState<Post | null>(null)
  const [lightboxPost, setLightboxPost]   = useState<Post | null>(null)
  const [releasingPost, setReleasingPost] = useState<Post | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Posts ({posts.length})</h2>
        <button
          onClick={() => { setShowAddForm(true); setEditingPost(null) }}
          className="text-sm bg-helden-yellow text-black px-3 py-1.5 rounded-lg hover:brightness-90 transition-colors"
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
                        {postTypeLabels[post.post_type]}
                      </span>
                    )}
                    {post.scheduled_date && (
                      <span className="text-xs text-gray-400">
                        {new Date(post.scheduled_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  {/* Copy da arte */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Copy da arte</span>
                      <StatusBadge status={post.status_copy} />
                    </div>
                    <ExpandableCaption text={post.copy_text || '—'} />
                  </div>

                  {/* Legenda */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Legenda</span>
                      <StatusBadge status={post.status_caption} />
                    </div>
                    {post.caption
                      ? <ExpandableCaption text={post.caption} />
                      : <p className="text-sm text-gray-400 italic">Sem legenda</p>
                    }
                  </div>

                  {/* Arte */}
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Arte</span>
                      {post.fase === 'arte'
                        ? <StatusBadge status={post.status_art} />
                        : <span className="text-xs text-gray-400 italic">aguardando liberação</span>
                      }
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
                      className="text-xs text-black bg-helden-yellow hover:brightness-90 rounded-md px-2 py-1 transition-colors"
                    >
                      Liberar arte
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

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
