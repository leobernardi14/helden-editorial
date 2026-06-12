'use client'

import { useEffect } from 'react'

export default function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string
  alt: string
  onClose: () => void
}) {
  // Fecha com Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Bloqueia scroll do body enquanto aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      {/* Botão X */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl leading-none font-light"
        aria-label="Fechar"
      >
        ×
      </button>

      {/* Imagem — clique interno não fecha */}
      <div
        className="max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  )
}
