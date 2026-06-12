# PROGRESS — Helden Editorial Calendar

## Checklist de Fases

- [x] **Fase 1** — Setup: Next.js + Tailwind + Supabase instalado + auth básico (login/logout) + RLS inicial ✓ commitado
- [x] **Fase 2** — Modelo de dados + migrations SQL + RLS completas ✓ commitado
- [x] **Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem ✓ commitado
- [x] **Fase 4** — Lado cliente: visualização, três botões (APROVADO/REPROVADO/AJUSTE) + campo obrigatório + histórico ✓ commitado
- [x] **Fase 5** — Painel de status/atividades + marcar calendário como concluído ✓ commitado
- [ ] **Fase 6** — README, seed e instruções de deploy na Vercel

---

## Estado atual

**Fase 5 concluída.** Fase 6 é a próxima (última).

- `/agencia/atividades` — feed das últimas respostas dos clientes, mais novas primeiro ✓
- Filtros por status com badges de contagem: Todos / Pendente / Aprovado / Reprovado / Ajuste ✓
- Visualização de posts pendentes (sem histórico) no filtro "Pendente" ✓
- Badge vermelho no nav "Atividades" com contagem de posts pendentes ✓
- Card "Atividades recentes" no dashboard com últimas 5 respostas + link "Ver todas" ✓
- Nav da agência atualizado com links Dashboard e Atividades ✓
- TypeScript sem erros ✓

## Próximo passo

**Fase 6** — README, seed e instruções de deploy:
- `README.md` em pt-BR com passo a passo completo: criar projeto Supabase, rodar migration, criar bucket Storage, rodar local e deploy na Vercel
- Instruções do seed (`seed_agencia.ts`)
- Variáveis de ambiente na Vercel
