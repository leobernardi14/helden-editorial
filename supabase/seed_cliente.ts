/**
 * Seed: cria um novo cliente (tabela clients + Auth user + profile).
 *
 * Uso:
 *   npx ts-node --project tsconfig.seed.json supabase/seed_cliente.ts \
 *     <nome_cliente> <email> <senha>
 *
 * Exemplo:
 *   npx ts-node --project tsconfig.seed.json supabase/seed_cliente.ts \
 *     "Lucas Copy" lucas@helden.com.br "Lucas@2026!"
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
  const clientName = process.argv[2]
  const email      = process.argv[3]
  const password   = process.argv[4]

  if (!clientName || !email || !password) {
    console.error('Uso: seed_cliente.ts <nome_cliente> <email> <senha>')
    process.exit(1)
  }

  // 1. Insere na tabela clients
  console.log(`Criando client: "${clientName}"`)
  const { data: clientRow, error: clientErr } = await supabase
    .from('clients')
    .insert({ name: clientName })
    .select('id')
    .single()

  if (clientErr || !clientRow) {
    console.error('Erro ao criar client:', clientErr?.message)
    process.exit(1)
  }
  const clientId = clientRow.id
  console.log(`  client_id: ${clientId}`)

  // 2. Cria usuário Auth com role=cliente e client_id nos metadados
  console.log(`Criando usuário Auth: ${email}`)
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'cliente',
      full_name: clientName,
      client_id: clientId,
    },
  })

  if (authErr || !authData.user) {
    console.error('Erro ao criar usuário Auth:', authErr?.message)
    // Reverte o client criado
    await supabase.from('clients').delete().eq('id', clientId)
    process.exit(1)
  }
  const userId = authData.user.id
  console.log(`  user_id: ${userId}`)

  // 3. Atualiza o profile gerado pelo trigger (role + client_id)
  console.log('Atualizando profile...')
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ role: 'cliente', client_id: clientId, full_name: clientName })
    .eq('id', userId)

  if (profileErr) {
    console.error('Erro ao atualizar profile:', profileErr.message)
    process.exit(1)
  }

  console.log('\n✓ Cliente criado com sucesso!')
  console.log(`  Nome:      ${clientName}`)
  console.log(`  Email:     ${email}`)
  console.log(`  Senha:     ${password}`)
  console.log(`  client_id: ${clientId}`)
  console.log(`  user_id:   ${userId}`)
}

main()
