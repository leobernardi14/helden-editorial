import { CalendarStatus, Post } from './types'

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

export type CalendarDisplayStatus = 'rascunho' | 'enviado' | 'aprovado_programar' | 'programado'

type PostMin = Pick<Post, 'fase' | 'status_copy' | 'status_caption' | 'status_art' | 'scheduled' | 'archived'>

export function calendarDisplayStatus(
  posts: PostMin[],
  calendarDbStatus: CalendarStatus,
): CalendarDisplayStatus {
  if (calendarDbStatus === 'rascunho') return 'rascunho'
  const active = posts.filter((p) => !p.archived)
  if (active.length === 0) return 'enviado'
  if (!active.every((p) => postProntoParaProgramar(p as Post))) return 'enviado'
  if (active.every((p) => p.scheduled)) return 'programado'
  return 'aprovado_programar'
}

const calDisplayMap: Record<CalendarDisplayStatus, { label: string; cls: string }> = {
  rascunho:         { label: 'Rascunho',          cls: 'bg-gray-100 text-gray-600' },
  enviado:          { label: 'Enviado',            cls: 'bg-blue-100 text-blue-700' },
  aprovado_programar: { label: 'Aprovado/Programar', cls: 'bg-amber-100 text-amber-700' },
  programado:       { label: 'Programado',         cls: 'bg-emerald-100 text-emerald-700' },
}

export function calendarDisplayBadge(status: CalendarDisplayStatus): { label: string; cls: string } {
  return calDisplayMap[status]
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
