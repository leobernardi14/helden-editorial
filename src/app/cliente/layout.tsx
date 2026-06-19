import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import Image from 'next/image'
import Link from 'next/link'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          <Link href="/cliente" className="shrink-0 min-w-0">
            <Image
              src="/logo-helden-claro.png"
              alt="Helden"
              width={89}
              height={36}
              priority
              className="h-7 w-auto sm:h-9"
            />
          </Link>
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
