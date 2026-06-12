# PROGRESS — Helden Editorial Calendar

## Checklist de Fases

- [x] **Fase 1** — Setup: Next.js + Tailwind + Supabase instalado + auth básico (login/logout) + RLS inicial ✓ commitado
- [x] **Fase 2** — Modelo de dados + migrations SQL + RLS completas ✓ commitado
- [x] **Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem ✓ commitado
- [ ] **Fase 4** — Lado cliente: visualização, três botões (APROVADO/REPROVADO/AJUSTE) + campo obrigatório + histórico
- [ ] **Fase 5** — Painel de status/atividades + marcar calendário como concluído
- [ ] **Fase 6** — README, seed e instruções de deploy na Vercel

---

## Estado atual

**Fase 3 concluída.** Fase 4 é a próxima.

- `src/lib/types.ts` — tipos TypeScript para todas as entidades ✓
- `src/app/actions/clients.ts` — criar cliente + criar login via service role ✓
- `src/app/actions/calendars.ts` — criar/editar calendário, liberar, concluir ✓
- `src/app/actions/posts.ts` — criar/editar/reordenar/deletar posts + upload Storage ✓
- `/agencia` — dashboard com lista de clientes, calendários e status agregado ✓
- `/agencia/clientes/[id]/novo-calendario` — formulário de novo calendário ✓
- `/agencia/calendarios/[id]` — página do calendário com lista de posts ✓
- `PostForm` — formulário de adicionar/editar post com preview de imagem ✓
- `PostHistoryModal` — modal de histórico de aprovações por post ✓
- `CalendarActions` — botão "Liberar para o cliente" e "Marcar como concluído" ✓
- `StatusBadge` — componente reutilizável de badge de status ✓
- TypeScript sem erros ✓

## Próximo passo

**Fase 4** — Lado cliente:
- `/cliente` — lista de calendários liberados do próprio cliente
- `/cliente/calendarios/[id]` — cards de posts com imagem + legenda + status
- Três botões por post: APROVADO | REPROVADO | AJUSTE
- Campo de texto obrigatório ao escolher AJUSTE (bloqueia envio se vazio)
- Gravar em `approval_history` + atualizar `posts.status`
- Indicador de progresso do calendário
- Permitir reabrir e mudar resposta (novo registro no histórico)
