# PROGRESS — Helden Editorial Calendar

## Checklist de Fases

- [x] **Fase 1** — Setup: Next.js + Tailwind + Supabase instalado + auth básico (login/logout) + RLS inicial
- [ ] **Fase 2** — Modelo de dados + migrations SQL + RLS completas
- [ ] **Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem
- [ ] **Fase 4** — Lado cliente: visualização, três botões (APROVADO/REPROVADO/AJUSTE) + campo obrigatório + histórico
- [ ] **Fase 5** — Painel de status/atividades + marcar calendário como concluído
- [ ] **Fase 6** — README, seed e instruções de deploy na Vercel

---

## Estado atual

**Fase 1 em andamento.**

- Scaffold Next.js (App Router) + TypeScript + Tailwind criado ✓
- Git iniciado com commit inicial ✓
- `@supabase/supabase-js` e `@supabase/ssr` instalados ✓
- Faltando: configurar variáveis de ambiente, criar clientes Supabase (browser/server), implementar login/logout e middleware de autenticação

## Próximo passo

Criar `.env.local.example`, utilitários Supabase (client browser + server + middleware), páginas de login e layout protegido com redirecionamento por role.
