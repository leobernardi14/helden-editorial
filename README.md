# Helden Editorial Calendar

Sistema de aprovação de calendários editoriais da agência Helden. A agência sobe posts (imagem + legenda), libera para o cliente e o cliente avalia cada post com **APROVADO**, **REPROVADO** ou **AJUSTE** — tudo rastreável com histórico completo.

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta na [Vercel](https://vercel.com) (gratuita)

---

## 1. Criar o projeto Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Escolha nome, senha do banco e região (preferencialmente South America - São Paulo)
3. Aguarde o projeto inicializar (~2 min)

---

## 2. Rodar a migration (tabelas + RLS)

No painel do Supabase, acesse **SQL Editor** e execute o conteúdo de:

```
supabase/migrations/001_initial.sql
```

Isso cria todas as tabelas (`clients`, `profiles`, `calendars`, `posts`, `approval_history`), enums, triggers e políticas RLS.

---

## 3. Criar o bucket de Storage

1. No painel Supabase, acesse **Storage** → **New bucket**
2. Nome: `post-images`
3. Marque **Public bucket** (as imagens precisam de URL pública)
4. Clique em **Create bucket**

Depois, configure a política de upload: acesse **Storage → post-images → Policies** e crie:

- **SELECT** (leitura pública): `true`
- **INSERT** (upload autenticado com role agência):
  ```sql
  auth.role() = 'authenticated'
  ```

---

## 4. Configurar variáveis de ambiente (local)

Copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Preencha com os valores do seu projeto Supabase (**Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

> ⚠️ **Nunca** versione o `.env.local` nem exponha a `SUPABASE_SERVICE_ROLE_KEY` no front-end.

---

## 5. Criar o primeiro usuário da agência

Com o `.env.local` preenchido, execute:

```bash
npx ts-node --project tsconfig.seed.json supabase/seed_agencia.ts
```

Opcionalmente, passe e-mail, senha e nome como argumentos:

```bash
npx ts-node --project tsconfig.seed.json supabase/seed_agencia.ts agencia@helden.com.br MinhaS3nha! "Equipe Helden"
```

O seed usa a **service role** para criar o usuário diretamente no Auth do Supabase.

---

## 6. Rodar localmente

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`.

---

## 7. Deploy na Vercel

### 7.1 Conectar o repositório

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório do GitHub (faça push antes, se necessário)
3. Framework: **Next.js** (detectado automaticamente)

### 7.2 Adicionar variáveis de ambiente

Em **Settings → Environment Variables**, adicione:

| Nome | Valor | Ambientes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://SEU_PROJETO.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sua_anon_key` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `sua_service_role_key` | Production, Preview, Development |

### 7.3 Configurar a URL do site no Supabase

1. No Supabase, acesse **Authentication → URL Configuration**
2. **Site URL**: `https://seu-projeto.vercel.app`
3. **Redirect URLs**: adicione `https://seu-projeto.vercel.app/**`

### 7.4 Deploy

Clique em **Deploy**. O build leva ~1-2 minutos. Após o deploy, a URL de produção estará disponível no painel da Vercel.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── actions/          # Server Actions (auth, clients, calendars, posts, approvals)
│   ├── agencia/          # Páginas da agência (dashboard, atividades, calendários)
│   ├── cliente/          # Páginas do cliente (lista de calendários, avaliação de posts)
│   └── login/            # Página de login
├── components/           # Componentes reutilizáveis (StatusBadge)
├── lib/
│   ├── supabase/         # Clientes Supabase (browser, server, service role)
│   └── types.ts          # Tipos TypeScript
└── middleware.ts          # Proteção de rotas e redirecionamento por role
supabase/
├── migrations/
│   └── 001_initial.sql   # Tabelas, enums, triggers e RLS
└── seed_agencia.ts       # Script para criar o primeiro usuário da agência
```

---

## Fluxo de uso

1. **Agência** faz login → cria um cliente e o login do cliente (e-mail + senha provisória)
2. **Agência** cria um calendário para o cliente e adiciona posts (imagem + legenda)
3. **Agência** clica em **"Liberar para o cliente"** — o calendário passa de `rascunho` para `enviado`
4. **Cliente** faz login → vê o calendário liberado → avalia cada post (APROVADO / REPROVADO / AJUSTE)
5. **Cliente** ao escolher AJUSTE deve descrever o que mudar (campo obrigatório)
6. **Agência** acompanha no painel de **Atividades** e edita os posts com feedback
7. Quando todos os posts estão aprovados, a **agência** marca o calendário como **Concluído**

---

## Segurança

- **RLS ativo** em todas as tabelas: clientes só acessam dados do próprio `client_id`
- **Service role** usada apenas em Server Actions — nunca exposta no front-end
- **Anon key** é a única chave presente no bundle do browser
- Constraint no banco garante `comment` obrigatório quando `action = 'ajuste'`

---

## Fora do escopo (v1)

Integrações com WhatsApp/e-mail, multi-agência, exportação para PDF e agendamento automático de publicação. O código está organizado para suportar essas extensões futuramente.
