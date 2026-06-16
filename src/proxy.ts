import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Rotas públicas
  if (pathname.startsWith('/login')) {
    if (user) {
      // Redireciona usuário já autenticado para seu painel
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const dest = profile?.role === 'agencia' ? '/agencia' : '/cliente'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return supabaseResponse
  }

  // Protege rotas /agencia e /cliente
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Garante que cliente não acesse rotas de agência e vice-versa
  if (pathname.startsWith('/agencia') || pathname.startsWith('/cliente')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, client_id')
      .eq('id', user.id)
      .single()

    if (pathname.startsWith('/agencia') && profile?.role !== 'agencia') {
      return NextResponse.redirect(new URL('/cliente', request.url))
    }
    if (pathname.startsWith('/cliente') && profile?.role !== 'cliente') {
      return NextResponse.redirect(new URL('/agencia', request.url))
    }

    // Bloqueia cliente arquivado: redireciona para /login sem apagar o usuário
    if (pathname.startsWith('/cliente') && profile?.role === 'cliente' && profile.client_id) {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('archived')
        .eq('id', profile.client_id)
        .single()

      if (clientRow?.archived) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
