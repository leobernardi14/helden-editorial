# PROGRESS — Helden Editorial Calendar

## Checklist de Fases

- [x] **Fase 1** — Setup: Next.js + Tailwind + Supabase instalado + auth básico (login/logout) + RLS inicial ✓ commitado
- [x] **Fase 2** — Modelo de dados + migrations SQL + RLS completas ✓ commitado
- [x] **Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem ✓ commitado
- [x] **Fase 4** — Lado cliente: visualização, três botões (APROVADO/REPROVADO/AJUSTE) + campo obrigatório + histórico ✓ commitado
- [ ] **Fase 5** — Painel de status/atividades + marcar calendário como concluído
- [ ] **Fase 6** — README, seed e instruções de deploy na Vercel

---

## Estado atual

**Fase 4 concluída.** Fase 5 é a próxima.

- `src/app/actions/approvals.ts` — grava em `approval_history` + atualiza `posts.status` ✓
- `/cliente` — lista calendários liberados com barra de progresso ✓
- `/cliente/calendarios/[id]` — cards de posts com imagem + legenda + barra de progresso do calendário ✓
- `PostCardCliente` — três botões (APROVADO / REPROVADO / AJUSTE), campo obrigatório para AJUSTE, bloqueio de envio se vazio ✓
- Permite reabrir e alterar resposta (gera novo registro no histórico) ✓
- Calendário concluído: desabilita avaliações ✓
- TypeScript sem erros ✓

## Próximo passo

**Fase 5** — Painel de status/atividades (lado agência):
- Feed de "atividades recentes" na `/agencia`: últimas respostas dos clientes, mais novas primeiro
- Filtro por status (pendente/aprovado/reprovado/ajuste)
- Badges de contagem por status no dashboard
- Botão "Marcar como concluído" já existe (CalendarActions) — garantir que aparece corretamente
