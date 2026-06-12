'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const name = (formData.get('name') as string).trim()
  const email = (formData.get('email') as string).trim()
  const password = (formData.get('password') as string).trim()
  const fullName = (formData.get('full_name') as string).trim()

  if (!name || !email || !password) return { error: 'Preencha todos os campos obrigatórios.' }

  // Cria o cliente
  const { data: clientData, error: clientErr } = await supabase
    .from('clients')
    .insert({ name })
    .select('id')
    .single()

  if (clientErr) return { error: clientErr.message }

  // Cria o usuário via service role (nunca expõe a service key no front)
  const admin = createServiceClient()
  const { error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'cliente',
      client_id: clientData.id,
      full_name: fullName || name,
    },
  })

  if (authErr) {
    // Rollback: remove o cliente criado
    await supabase.from('clients').delete().eq('id', clientData.id)
    return { error: authErr.message }
  }

  revalidatePath('/agencia')
  return { success: true, clientId: clientData.id }
}

export async function updateClientAction(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const name = (formData.get('name') as string).trim()

  if (!id || !name) return { error: 'Dados inválidos.' }

  const { error } = await supabase.from('clients').update({ name }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/agencia')
  return { success: true }
}
