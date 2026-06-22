import { Post } from './types'

export function postCompleto(p: Post): boolean {
  const copysFeitas = p.status_copy !== 'pendente' && p.status_caption !== 'pendente'
  if (p.fase === 'copys') return copysFeitas
  return copysFeitas && p.status_art !== 'pendente'
}

export function postProntoParaProgramar(p: Post): boolean {
  return (
    p.fase === 'arte' &&
    p.status_copy === 'aprovado' &&
    p.status_caption === 'aprovado' &&
    p.status_art === 'aprovado'
  )
}

export function faseBadge(p: Post): { label: string; cls: string } {
  if (p.scheduled) {
    return { label: 'Post Programado', cls: 'bg-emerald-600 text-white' }
  }
  if (postProntoParaProgramar(p)) {
    return { label: 'Programar Post', cls: 'bg-helden-yellow text-black' }
  }
  if (p.fase === 'arte') {
    return { label: 'Fase: Arte', cls: 'bg-purple-100 text-purple-700' }
  }
  return { label: 'Fase: Copys', cls: 'bg-blue-100 text-blue-700' }
}
