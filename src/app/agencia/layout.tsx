import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import Link from 'next/link'

export default async function AgenciaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, pendingRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', user.id).single(),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'pendente'),
  ])

  const profile = profileRes.data
  const pendingCount = pendingRes.count ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">H</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">Helden</span>
            </div>
            <nav className="flex items-center gap-1">
              <Link href="/agencia" className="text-sm text-gray-600 hover:text-black px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                Dashboard
              </Link>
              <Link href="/agencia/atividades" className="relative text-sm text-gray-600 hover:text-black px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                Atividades
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">{profile?.full_name}</span>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
