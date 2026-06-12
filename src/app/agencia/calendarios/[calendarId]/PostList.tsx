'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Post, CalendarStatus, PostStatus } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import PostForm from './PostForm'
import PostHistoryModal from './PostHistoryModal'
import ImageLightbox from '@/components/ImageLightbox'

const postTypeLabels: Record<string, string> = {
  feed: 'Feed', story: 'Story', reels: 'Reels', carrossel: 'Carrossel',
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [historyPost, setHistoryPost] = useState<Post | null>(null)
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null)

  const needsAction: PostStatus[] = ['reprovado', 'ajuste']

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
              needsAction.includes(post.status) ? 'border-yellow-200' : 'border-gray-100'
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
            ) : (
              <div className="flex gap-4">
                {/* Imagem */}
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
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sem imagem</div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
                    <StatusBadge status={post.status} />
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
                  <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-line">
                    {post.caption ?? <span className="text-gray-400 italic">Sem legenda</span>}
                  </p>
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
