import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { CopysPdfDocument, CopysPdfPost } from '@/lib/pdf/CopysPdfDocument'
import { Post } from '@/lib/types'

function slugify(s: string) {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item'
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ calendarId: string }> }
) {
  const { calendarId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'agencia') return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })

  const { data: calendar } = await supabase
    .from('calendars')
    .select('id, title, reference_month, clients(name)')
    .eq('id', calendarId)
    .single()

  if (!calendar) return NextResponse.json({ error: 'Calendário não encontrado.' }, { status: 404 })

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('calendar_id', calendarId)
    .eq('status_copy', 'aprovado')
    .order('position')

  if (!posts || posts.length === 0) {
    return NextResponse.json(
      { error: 'Nenhum post com copy da arte aprovada neste calendário ainda.' },
      { status: 422 }
    )
  }

  const clientName = (calendar.clients as unknown as { name: string } | null)?.name ?? 'Cliente'

  const pdfPosts: CopysPdfPost[] = (posts as Post[]).map((p) => ({
    position: p.position,
    post_type: p.post_type,
    scheduled_date: p.scheduled_date,
    copy_text: p.copy_text,
  }))

  const buffer = await renderToBuffer(
    CopysPdfDocument({
      clientName,
      calendarTitle: calendar.title,
      referenceMonth: calendar.reference_month,
      posts: pdfPosts,
    })
  )

  const fileName = `copys-aprovadas-${slugify(clientName)}-${slugify(calendar.reference_month || calendar.title)}.pdf`

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  })
}
