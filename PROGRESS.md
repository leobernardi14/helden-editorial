# PROGRESS — Helden Editorial Calendar

## Checklist de Fases

- [x] **Fase 1** — Setup: Next.js + Tailwind + Supabase instalado + auth básico (login/logout) + RLS inicial ✓ commitado
- [ ] **Fase 2** — Modelo de dados + migrations SQL + RLS completas
- [ ] **Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem
- [ ] **Fase 4** — Lado cliente: visualização, três botões (APROVADO/REPROVADO/AJUSTE) + campo obrigatório + histórico
- [ ] **Fase 5** — Painel de status/atividades + marcar calendário como concluído
- [ ] **Fase 6** — README, seed e instruções de deploy na Vercel

---

## Estado atual

**Fase 1 concluída.** Fase 2 é a próxima.

- Scaffold Next.js (App Router) + TypeScript + Tailwind ✓
- `@supabase/supabase-js` e `@supabase/ssr` instalados ✓
- `src/lib/supabase/client.ts` e `server.ts` (inclui `createServiceClient`) ✓
- `src/middleware.ts` — protege rotas, redireciona por role ✓
- `src/app/actions/auth.ts` — Server Actions de login e logout ✓
- Página de login (`/login`) com formulário client-side ✓
- Layouts protegidos `/agencia` e `/cliente` com header + logout ✓
- TypeScript sem erros (`tsc --noEmit` passou) ✓
- `.env.local.example` documentado ✓

## Próximo passo

**Fase 2** — Modelo de dados + migrations SQL + RLS completas:
- Criar arquivo `supabase/migrations/001_initial.sql` com todas as tabelas (clients, profiles, calendars, posts, approval_history), enums e políticas RLS.
- Criar seed para o primeiro usuário da agência.
