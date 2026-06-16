export type UserRole = 'agencia' | 'cliente'
export type CalendarStatus = 'rascunho' | 'enviado' | 'concluido'
export type PostStatus = 'pendente' | 'aprovado' | 'reprovado' | 'ajuste'
export type PostType = 'feed' | 'story' | 'reels' | 'carrossel'
export type ApprovalAction = 'aprovado' | 'reprovado' | 'ajuste'
export type ApprovalPart = 'copy' | 'caption' | 'art'
export type PostFase = 'copys' | 'arte'

export interface Client {
  id: string
  name: string
  logo_url: string | null
  archived: boolean
  archived_at: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  role: UserRole
  client_id: string | null
  full_name: string | null
  created_at: string
}

export interface Calendar {
  id: string
  client_id: string
  title: string
  reference_month: string | null
  status: CalendarStatus
  created_at: string
}

export interface Post {
  id: string
  calendar_id: string
  position: number
  image_url: string | null
  copy_text: string
  caption: string | null
  post_type: PostType | null
  scheduled_date: string | null
  status: PostStatus        // legado — removido na E7
  status_copy: PostStatus
  status_caption: PostStatus
  status_art: PostStatus
  fase: PostFase
  created_at: string
  updated_at: string
}

export interface ApprovalHistory {
  id: string
  post_id: string
  part: ApprovalPart
  action: ApprovalAction
  comment: string | null
  responded_by: string
  created_at: string
  profiles?: { full_name: string | null; email: string }
}

// Tipos com agregações
export interface CalendarWithStats extends Calendar {
  total_posts: number
  approved: number
  reproved: number
  adjustment: number
  pending: number
}

export interface ClientWithCalendars extends Client {
  calendars: CalendarWithStats[]
}
