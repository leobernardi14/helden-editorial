# PROGRESS — Helden Editorial Calendar

## Checklist de Fases

- [x] **Fase 1** — Setup: Next.js + Tailwind + Supabase instalado + auth básico (login/logout) + RLS inicial ✓
- [x] **Fase 2** — Modelo de dados + migrations SQL + RLS completas ✓
- [x] **Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem ✓
- [x] **Fase 4** — Lado cliente: visualização, três botões (APROVADO/REPROVADO/AJUSTE) + campo obrigatório + histórico ✓
- [x] **Fase 5** — Painel de status/atividades + marcar calendário como concluído ✓
- [x] **Fase 6** — README, seed e instruções de deploy na Vercel ✓

---

## Estado atual

**PROJETO CONCLUÍDO. Todas as 6 fases entregues.**

## Para colocar em produção

1. Criar projeto Supabase e rodar `supabase/migrations/001_initial.sql`
2. Criar bucket `post-images` (público) no Supabase Storage
3. Copiar `.env.local.example` → `.env.local` e preencher as chaves
4. Rodar `supabase/seed_agencia.ts` para criar o primeiro usuário da agência
5. Push para GitHub → importar na Vercel → adicionar as 3 variáveis de ambiente
6. Configurar Site URL e Redirect URLs no Supabase Auth

Ver `README.md` para passo a passo detalhado.
