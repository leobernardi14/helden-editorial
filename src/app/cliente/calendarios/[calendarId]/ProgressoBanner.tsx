'use client'

import { useEffect, useState } from 'react'
import { Post } from '@/lib/types'

export default function ProgressoBanner({
  posts: initialPosts,
}: {
  posts: Post[]
}) {
  // Sincroniza quando o Server Component re-renderiza (revalidatePath)
  const [posts, setPosts] = useState(initialPosts)
  useEffect(() => { setPosts(initialPosts) }, [initialPosts])

  const total = posts.length
  const done = posts.filter((p) => p.status !== 'pendente').length
  const allDone = total > 0 && done === total
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  if (total === 0) return null

  return (
    <>
      {/* Banner de revisão concluída */}
      {allDone && (
        <div className="bg-green-600 text-white rounded-xl p-4 mb-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">✓</span>
            <div>
              <p className="font-semibold text-base">Revisão concluída!</p>
              <p className="text-green-100 text-sm mt-0.5">
                Suas respostas foram enviadas para a Helden. Você ainda pode alterar qualquer avaliação enquanto o calendário estiver aberto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barra de progresso */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-gray-700">Seu progresso</span>
          <span className="text-gray-500">{done} de {total} avaliados</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </>
  )
}
