'use client'

import { useEffect, useRef, useState } from 'react'

const LINE_CLAMP = 3

export default function ExpandableCaption({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // scrollHeight > clientHeight indica que o texto foi cortado
    setClamped(el.scrollHeight > el.clientHeight + 1)
  }, [text])

  return (
    <div>
      <p
        ref={ref}
        className={`text-sm text-gray-700 whitespace-pre-wrap leading-relaxed${
          !expanded ? ` line-clamp-${LINE_CLAMP}` : ''
        }`}
      >
        {text}
      </p>
      {clamped && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 transition-colors"
        >
          {expanded ? 'Ver menos' : 'Ver mais'}
        </button>
      )}
    </div>
  )
}
