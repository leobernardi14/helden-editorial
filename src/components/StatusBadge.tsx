import { CalendarStatus, PostStatus } from '@/lib/types'

const calendarLabels: Record<CalendarStatus, { label: string; cls: string }> = {
  rascunho: { label: 'Rascunho', cls: 'bg-gray-100 text-gray-600' },
  enviado:  { label: 'Enviado',  cls: 'bg-blue-100 text-blue-700' },
  concluido:{ label: 'Concluído',cls: 'bg-green-100 text-green-700' },
}

const postLabels: Record<PostStatus, { label: string; cls: string }> = {
  pendente:  { label: 'Pendente',  cls: 'bg-gray-100 text-gray-500' },
  aprovado:  { label: 'Aprovado',  cls: 'bg-green-100 text-green-700' },
  reprovado: { label: 'Reprovado', cls: 'bg-red-100 text-red-700' },
  ajuste:    { label: 'Ajuste',    cls: 'bg-yellow-100 text-yellow-700' },
}

type Status = CalendarStatus | PostStatus

function getConfig(status: Status) {
  if (status in calendarLabels) return calendarLabels[status as CalendarStatus]
  return postLabels[status as PostStatus]
}

export default function StatusBadge({ status }: { status: Status }) {
  const { label, cls } = getConfig(status)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${cls}`}>
      {label}
    </span>
  )
}
