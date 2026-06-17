import { Post } from './types'

export function postCompleto(p: Post): boolean {
  const copysFeitas = p.status_copy !== 'pendente' && p.status_caption !== 'pendente'
  if (p.fase === 'copys') return copysFeitas
  return copysFeitas && p.status_art !== 'pendente'
}
