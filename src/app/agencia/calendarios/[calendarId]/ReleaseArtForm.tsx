'use client'

import { useState } from 'react'
import { Post } from '@/lib/types'
import { releaseArtAction } from '@/app/actions/posts'
import { createClient } from '@/lib/supabase/client'

const MAX_SIZE_BYTES = 10 * 1024 * 1024

async function uploadImageToStorage(file: File, calendarId: string): Promise<{ url: string } | { error: string }> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${calendarId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('post-images').upload(path, file, { contentType: file.type, upsert: false })
  if (error) return { error: `Erro no upload: ${error.message}` }
  const { data } = supabase.storage.from('post-images').getPublicUrl(path)
  return { url: data.publicUrl }
}

export default function ReleaseArtForm({
  post,
  calendarId,
  onSuccess,
  onCancel,
}: {
  post: Post
  calendarId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const loading = uploading || saving

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE_BYTES) { setError('A imagem não pode ultrapassar 10 MB.'); e.target.value = ''; return }
    setError(null)
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    const result = await uploadImageToStorage(file, calendarId)
    if ('error' in result) {
      setError(result.error)
      setPreview(null)
      setUploadedUrl(null)
    } else {
      setUploadedUrl(result.url)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (uploading) return
    if (!uploadedUrl) { setError('Selecione a imagem da arte antes de liberar.'); return }
    setError(null)
    setSaving(true)
    const fd = new FormData()
    fd.append('post_id', post.id)
    fd.append('calendar_id', calendarId)
    fd.append('image_url', uploadedUrl)
    const result = await releaseArtAction(fd)
    if (result?.error) { setError(result.error); setSaving(false) }
    else onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        {preview && (
          <div className="relative w-32 h-32 mb-2">
            <img src={preview} alt="Preview da arte" className="w-full h-full object-cover rounded-lg" />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-medium">Enviando…</span>
              </div>
            )}
          </div>
        )}
        {uploading && !preview && (
          <p className="text-sm text-blue-600 mb-2 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Enviando imagem…
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={loading}
          className="block text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 disabled:opacity-50"
        />
        <p className="text-xs text-gray-400 mt-1">Máximo 10 MB. PNG, JPG, WebP.</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 text-sm text-gray-600 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !uploadedUrl}
          className="flex-1 bg-black text-white text-sm font-medium rounded-lg py-2.5 hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          {uploading ? 'Aguarde o upload…' : saving ? 'Liberando…' : 'Liberar arte para aprovação'}
        </button>
      </div>
    </form>
  )
}
