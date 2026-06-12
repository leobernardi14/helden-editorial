/**
 * Seed: cria o primeiro usuário da agência no Supabase.
 *
 * Uso:
 *   npx ts-node --project tsconfig.seed.json supabase/seed_agencia.ts
 *
 * Variáveis necessárias no ambiente (ou em .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const email = process.argv[2] || 'agencia@helden.com.br'
  const password = process.argv[3] || 'Helden@2024!'
  const fullName = process.argv[4] || 'Equipe Helden'

  console.log(`Criando usuário de agência: ${email}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'agencia',
      full_name: fullName,
    },
  })

  if (error) {
    console.error('Erro ao criar usuário:', error.message)
    process.exit(1)
  }

  console.log('Usuário criado com sucesso!')
  console.log(`  ID:    ${data.user.id}`)
  console.log(`  Email: ${email}`)
  console.log(`  Senha: ${password}`)
  console.log('\nAltere a senha após o primeiro login.')
}

main()
