import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'
import Image from 'next/image'
import { getActivitiesLastViewed } from '@/app/actions/notifications'

export default async function AgenciaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const lastViewed = await getActivitiesLastViewed()

  const [profileRes, newActivityRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    lastViewed
      ? supabase.from('approval_history').select('id', { count: 'exact', head: true }).gt('created_at', lastViewed)
      : supabase.from('approval_history').select('id', { count: 'exact', head: true }),
  ])

  const profile = profileRes.data
  const pendingCount = newActivityRes.count ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-5 min-w-0">
            <Link href="/agencia" className="shrink-0">
              <Image
                src="/logo-helden-claro.png"
                alt="Helden"
                width={89}
                height={36}
                priority
                className="h-7 w-auto sm:h-9"
              />
            </Link>
            <nav className="flex items-center gap-0.5 sm:gap-1 min-w-0">
              <Link
                href="/agencia"
                className="text-xs sm:text-sm text-white/70 hover:text-white px-2 sm:px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                href="/agencia/atividades"
                className="relative text-xs sm:text-sm text-white/70 hover:text-white px-2 sm:px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                Atividades
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-sm text-white/60 hidden sm:block">{profile?.full_name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6">{children}</main>
    </div>
  )
}
