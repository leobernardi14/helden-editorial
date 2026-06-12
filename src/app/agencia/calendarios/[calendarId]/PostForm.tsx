'use client'

import { useState } from 'react'
import { Post } from '@/lib/types'
import { createPostAction, updatePostAction } from '@/app/actions/posts'

export default function PostForm({
  calendarId,
  post,
  onSuccess,
  onCancel,
}: {
  calendarId: string
  post?: Post
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(post?.image_url ?? null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const action = post ? updatePostAction : createPostAction
    const result = await action(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="calendar_id" value={calendarId} />
      {post && <input type="hidden" name="post_id" value={post.id} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Imagem {!post && <span className="text-gray-400">(opcional)</span>}
        </label>
        {preview && (
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg mb-2" />
        )}
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Legenda</label>
        <textarea
          name="caption"
          rows={4}
          defaultValue={post?.caption ?? ''}
          className="input resize-none"
          placeholder="Digite a legenda do post…"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select name="post_type" defaultValue={post?.post_type ?? ''} className="input">
            <option value="">Selecione</option>
            <option value="feed">Feed</option>
            <option value="story">Story</option>
            <option value="reels">Reels</option>
            <option value="carrossel">Carrossel</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Data prevista</label>
          <input
            name="scheduled_date"
            type="date"
            defaultValue={post?.scheduled_date ?? ''}
            className="input"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black text-white text-sm font-medium rounded-lg py-2.5 hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Salvando…' : post ? 'Salvar alterações' : 'Adicionar post'}
        </button>
      </div>
    </form>
  )
}
