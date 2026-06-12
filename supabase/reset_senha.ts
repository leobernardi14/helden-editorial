/**
 * Reset de senha de um usuário via Supabase Admin API.
 * Uso: npx ts-node --project tsconfig.seed.json supabase/reset_senha.ts <email> <nova_senha>
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  process.exit(1)
}

const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.error('Uso: npx ts-node --project tsconfig.seed.json supabase/reset_senha.ts <email> <nova_senha>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // Busca o usuário pelo e-mail
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) { console.error('Erro ao listar usuários:', listErr.message); process.exit(1) }

  const user = users.find((u) => u.email === email)
  if (!user) { console.error(`Usuário não encontrado: ${email}`); process.exit(1) }

  // Atualiza só a senha — role e client_id nos metadados ficam intactos
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword })
  if (error) { console.error('Erro ao atualizar senha:', error.message); process.exit(1) }

  console.log(`Senha atualizada com sucesso para ${email} (ID: ${user.id})`)
}

main()
