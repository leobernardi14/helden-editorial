'use client'

import { useEffect, useState } from 'react'
import { Post, ApprovalHistory } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import StatusBadge from '@/components/StatusBadge'

const actionLabels: Record<string, string> = {
  aprovado: 'Aprovado', reprovado: 'Reprovado', ajuste: 'Ajuste solicitado',
  aprovado_interno: 'Aprovado internamente pela Helden',
}

export default function PostHistoryModal({
  post,
  onClose,
}: {
  post: Post
  onClose: () => void
}) {
  const [history, setHistory] = useState<ApprovalHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('approval_history')
      .select(`*, profiles(full_name, email)`)
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setHistory((data as ApprovalHistory[]) ?? [])
        setLoading(false)
      })
  }, [post.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Histórico do post</h2>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              Copy: <StatusBadge status={post.status_copy} />
              · Legenda: <StatusBadge status={post.status_caption} />
              · Arte: <StatusBadge status={post.status_art} />
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {loading && <p className="text-sm text-gray-400">Carregando…</p>}
          {!loading && history.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Nenhuma resposta ainda.</p>
          )}
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      h.part === 'copy'    ? 'bg-blue-50 text-blue-700' :
                      h.part === 'caption' ? 'bg-purple-50 text-purple-700' :
                                             'bg-orange-50 text-orange-700'
                    }`}>
                      {h.part === 'copy' ? 'Copy da arte' : h.part === 'caption' ? 'Legenda' : 'Arte'}
                    </span>
                    <span className={`text-sm font-medium ${
                      h.action === 'aprovado'          ? 'text-green-700' :
                      h.action === 'aprovado_interno'  ? 'text-indigo-700' :
                      h.action === 'reprovado'         ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {actionLabels[h.action]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(h.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {h.profiles?.full_name ?? h.profiles?.email ?? 'Cliente'}
                </p>
                {h.comment && (
                  <p className={`mt-2 text-sm rounded-lg p-3 whitespace-pre-line border ${
                    h.action === 'reprovado'        ? 'text-red-700 bg-red-50 border-red-100' :
                    h.action === 'ajuste'            ? 'text-yellow-700 bg-yellow-50 border-yellow-100' :
                    h.action === 'aprovado_interno'  ? 'text-indigo-700 bg-indigo-50 border-indigo-100' :
                                                       'text-gray-700 bg-yellow-50 border-yellow-100'
                  }`}>
                    {h.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
