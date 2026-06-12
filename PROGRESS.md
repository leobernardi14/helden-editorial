# PROGRESS — Helden Editorial Calendar

## Checklist de Fases

- [x] **Fase 1** — Setup: Next.js + Tailwind + Supabase instalado + auth básico (login/logout) + RLS inicial ✓ commitado
- [x] **Fase 2** — Modelo de dados + migrations SQL + RLS completas ✓ commitado
- [ ] **Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem
- [ ] **Fase 4** — Lado cliente: visualização, três botões (APROVADO/REPROVADO/AJUSTE) + campo obrigatório + histórico
- [ ] **Fase 5** — Painel de status/atividades + marcar calendário como concluído
- [ ] **Fase 6** — README, seed e instruções de deploy na Vercel

---

## Estado atual

**Fase 2 concluída.** Fase 3 é a próxima.

- Fases 1 e 2 commitadas ✓
- `supabase/migrations/001_initial.sql` — enums, tabelas, triggers, índices e RLS completas ✓
- RLS: agência acesso total; cliente isolado por `client_id`; cliente só vê calendários `enviado`/`concluido`; só insere `approval_history` em calendários liberados ✓
- Constraint DB garante `comment` obrigatório quando `action = 'ajuste'` ✓
- `supabase/seed_agencia.ts` — cria primeiro usuário de agência via Admin API ✓
- `tsconfig.seed.json` para rodar o seed com `ts-node` ✓

## Próximo passo

**Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem:
- `/agencia` — dashboard com lista de clientes e status agregado
- Criar/editar cliente + criar login de cliente (via service role)
- Criar/editar calendário
- Adicionar/reordenar/editar posts com upload de imagem para Supabase Storage
- Botão "Liberar para o cliente" (rascunho → enviado)
