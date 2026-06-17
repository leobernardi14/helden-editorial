import { login } from '@/app/actions/auth'
import LoginForm from './LoginForm'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/logo-helden-escuro.png"
            alt="Helden"
            width={140}
            height={56}
            priority
            className="mx-auto mb-2"
          />
          <p className="text-gray-500 text-sm">Calendário Editorial</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Entrar na sua conta</h2>
          <LoginForm action={login} />
        </div>
      </div>
    </main>
  )
}
