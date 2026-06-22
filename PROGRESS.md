# PROGRESS — Helden Editorial Calendar

## Checklist de Fases

- [x] **Fase 1** — Setup: Next.js + Tailwind + Supabase instalado + auth básico (login/logout) + RLS inicial ✓
- [x] **Fase 2** — Modelo de dados + migrations SQL + RLS completas ✓
- [x] **Fase 3** — Lado agência: CRUD de clientes, calendários e posts com upload de imagem ✓
- [x] **Fase 4** — Lado cliente: visualização, três botões (APROVADO/REPROVADO/AJUSTE) + campo obrigatório + histórico ✓
- [x] **Fase 5** — Painel de status/atividades + marcar calendário como concluído ✓
- [x] **Fase 6** — README, seed e instruções de deploy na Vercel ✓

---

## Feature: Campos separados Copy + Legenda com aprovação independente

- [x] **E1 — Migration SQL** — entregar SQL exato para rodar no Supabase
- [ ] **E2 — Tipos + Actions** — `types.ts`, `posts.ts`, `approvals.ts`
- [ ] **E3 — Formulário agência** — PostForm (2 campos obrigatórios) + PostList (2 status)
- [ ] **E4 — Lado cliente** — PostCardCliente: dois blocos independentes
- [ ] **E5 — Progresso e banner** — ProgressoBanner conta posts com ambas as partes avaliadas
- [ ] **E6 — Agência: histórico e Atividades** — part (copy|caption) visível em todo o fluxo
- [ ] **E7 — Limpeza e push final** — remover coluna `status` legada, tsc limpo

---

## Feature: Gestão de clientes — arquivamento (soft delete)

- [ ] **F1 — Migration SQL** — `archived BOOLEAN` + `archived_at TIMESTAMPTZ` em `clients`
- [ ] **F2 — Tipos + Actions** — `Client` type, `archiveClientAction`, `unarchiveClientAction`
- [ ] **F3 — Bloqueio de acesso** — proxy bloqueia cliente arquivado (redirect `/login`)
- [x] **F4 — UI agência** — Edit modal, botão Arquivar com confirmação, toggle "Ver arquivados", botão Desarquivar

---

## Feature: Fluxo de 2 fases — Copys → Arte

### Modelo de dados

Cada post tem **3 aprovações independentes** e **1 fase**:

| Campo        | Tipo        | Default    | Quem avalia  |
|-------------|-------------|-----------|--------------|
| status_copy    | post_status | pendente  | cliente (fase copys) |
| status_caption | post_status | pendente  | cliente (fase copys) |
| status_art     | post_status | pendente  | cliente (fase arte)  |
| fase           | TEXT        | 'copys'   | agência muda para 'arte' |

### Regras de negócio

- **Fase copys**: cliente vê e avalia copy + legenda. Arte mostra placeholder.
- **Transição**: agência sobe a imagem e clica "Liberar arte" → `fase = 'arte'`
- **Fase arte**: cliente vê imagem real e avalia status_art. Copys mostram status anterior.
- **Progresso**: post "completo" na fase copys = status_copy ≠ pendente E status_caption ≠ pendente. Na fase arte = as 3 partes ≠ pendente.
- **Banner de conclusão**: aparece quando todos os posts estão completos para a fase atual.

### Sub-etapas

- [ ] **G1 — Migration SQL** — status_art, fase em posts; fix CHECK constraint em approval_history
- [ ] **G2 — Tipos + Actions** — Post type, ApprovalPart inclui 'art'; posts.ts, approvals.ts
- [ ] **G3 — Agência: PostList + PostForm + ação "Liberar arte"**
- [ ] **G4 — Cliente: PostCardCliente dois blocos fase-conscientes + ProgressoBanner**
- [ ] **G5 — Atividades: part='art' visível no feed**

---

## Feature: Identidade visual Helden (brand refresh)

- [x] **H1 — Paleta** — `#000000` preto da marca + `#f4b812` amarelo da marca em variáveis CSS/Tailwind v4
- [x] **H2 — Tipografia** — Inter via next/font, hierarquia de títulos revisada
- [x] **H3 — Cabeçalho** — fundo preto, logo clara nos dois lados (agência + cliente); logo escura na tela de login
- [x] **H4 — Barras de progresso** — preenchimento amarelo da marca (fundo cinza neutro)
- [x] **H5 — Badge "Programar Post"** — amarelo da marca com texto preto
- [x] **H6 — Acessibilidade** — amarelo nunca com texto branco; botões primários preto/branco mantidos

---

## Feature: Editar e arquivar calendários

- [x] **I1 — Migration SQL** — `archived BOOLEAN NOT NULL DEFAULT false` + `archived_at TIMESTAMPTZ` em `calendars`
- [x] **I2 — Tipos + Actions** — `Calendar` type, `archiveCalendarAction`, `unarchiveCalendarAction`, `updateCalendarAction` com role check
- [x] **I3 — UI agência** — Botão Editar (modal título + mês), botão Arquivar/Desarquivar com confirmação na página do calendário; toggle "Ver arquivados" no dashboard por cliente
- [x] **I4 — Lado do cliente** — calendários arquivados excluídos da query (`.eq('archived', false)`)

---

## Feature: Gerar PDF das copys aprovadas (referência para o designer)

- [x] **J1 — Lib de geração** — `@react-pdf/renderer` (puro JS, sem binários nativos, funciona em Vercel serverless)
- [x] **J2 — Route handler** — `GET /api/agencia/calendarios/[calendarId]/copys-pdf`, verifica role `agencia` no servidor
- [x] **J3 — Conteúdo** — apenas posts com `status_copy='aprovado'` E `status_caption='aprovado'`; cabeçalho com logo escura, cliente, calendário, mês, data de geração
- [x] **J4 — UI agência** — botão "Gerar PDF das copys" na página do calendário; mensagem clara quando não há posts aprovados
- [x] **J5 — Nome do arquivo** — `copys-aprovadas-[cliente]-[mes].pdf`

---

## Feature: Marcar post como "Post Programado" (agência)

- [x] **K1 — Migration SQL** — `scheduled BOOLEAN NOT NULL DEFAULT false` + `scheduled_at TIMESTAMPTZ` em `posts`
- [x] **K2 — Tipos + Actions** — `Post.scheduled`/`scheduled_at`, `markPostScheduledAction`/`unmarkPostScheduledAction` com role check
- [x] **K3 — Badge** — `faseBadge()` prioriza "Post Programado" (verde esmeralda) sobre "Programar Post"; `postCompleto()` inalterado
- [x] **K4 — UI agência** — botão "Marcar como programado" quando as 3 partes aprovadas; "Desmarcar programado" com confirmação. Estado interno da agência, não afeta o cliente

---

## Feature: Excluir/arquivar post (agência)

- [x] **L1 — Migration SQL** — `archived BOOLEAN NOT NULL DEFAULT false` + `archived_at TIMESTAMPTZ` em `posts`
- [x] **L2 — Regra de exclusão** — exclusão definitiva só quando o post NÃO tem nenhuma linha em `approval_history` (nunca avaliado pelo cliente); caso contrário, arquiva preservando histórico. Critério verificado no servidor (`removePostAction`), nunca confiado ao cliente
- [x] **L3 — Tipos + Actions** — `Post.archived`/`archived_at`, `removePostAction` (decide excluir vs. arquivar), `unarchivePostAction`, ambas com role check
- [x] **L4 — UI agência** — botão único cujo rótulo reflete a ação real ("Excluir" em vermelho para rascunho sem histórico, "Arquivar" neutro quando já há histórico), sempre com confirmação explícita; toggle "Ver posts arquivados" com opção de Desarquivar e ver Histórico
- [x] **L5 — Lado do cliente** — query do cliente filtra `archived=false`; posts arquivados nunca aparecem. Numeração dos posts restantes (agência e cliente) segue o índice da lista filtrada, sem gaps

---

## Feature: Aprovação interna pela agência (após ajuste do cliente)

- [x] **M1 — Migration SQL** — novo valor `'aprovado_interno'` no enum `approval_action` (sem novas colunas; histórico já tinha `comment` e `responded_by`)
- [x] **M2 — Tipos** — `ApprovalHistoryAction = ApprovalAction | 'aprovado_interno'`; `ApprovalHistory.action` usa o novo tipo
- [x] **M3 — Regra de elegibilidade** — só permite aprovar internamente uma parte cujo status atual seja exatamente `'ajuste'` (nunca `pendente`/`reprovado`); verificado no servidor (`approveInternallyAction`), independente do que a UI mostra
- [x] **M4 — Actions** — `approveInternallyAction(postId, calendarId, part)`: confirma role `agencia`, busca o comentário do ajuste mais recente do cliente para referência, grava `action='aprovado_interno'` no histórico (autor = usuário da agência, nunca o cliente) e atualiza `status_copy`/`status_caption`/`status_art` para `'aprovado'`
- [x] **M5 — UI agência** — botão "Aprovar internamente (após ajuste)" em cada seção (copy/legenda/arte) quando o status daquela parte é "Ajuste", com confirmação explícita
- [x] **M6 — Histórico (agência)** — `PostHistoryModal` e `AtividadesFeed` exibem "Aprovado internamente pela Helden" / "Aprovado pela Helden (após ajuste)" em cor distinta (índigo), nunca confundido com aprovação do cliente
- [x] **M7 — Visível ao cliente** — `PostCardCliente` mostra selo "Aprovado pela Helden (após seu ajuste)" ao lado do badge de status quando a aprovação daquela parte foi interna, calculado a partir da última linha de histórico daquele post/parte
- [x] **M8 — Progresso** — reaproveita `status_copy`/`status_caption`/`status_art = 'aprovado'`; `postCompleto()`/`postProntoParaProgramar()` (função centralizada) tratam a parte como aprovada sem qualquer alteração de código

---

## Melhorias futuras (v2)

Itens identificados mas conscientemente postergados para depois do período de uso real. Retomar quando houver sinal de demanda real.

- [ ] **Upload de logo do cliente** — exibir no lugar/junto do nome, no sistema e no PDF. Fazer bem feito: tratar formatos imprevisíveis (horizontal/quadrado/vertical), fundos variados, fallback para nome em texto quando não houver logo.
- [ ] **Integração com Meta/Instagram** — publicação automática dos posts aprovados. Avaliar via serviço intermediário; exige verificação de negócio e app review da Meta.
- [ ] **Cantos arredondados do placeholder de arte (lado cliente)** — cosmético, baixa prioridade.
- [ ] **Autoatendimento de "esqueci minha senha" para o cliente** — hoje o reset é feito pela agência (`resetClientPasswordAction`), e isso permanece assim por ora. Registrado como opção futura, não uma lacuna a corrigir.

---

## Para colocar em produção

1. Criar projeto Supabase e rodar `supabase/migrations/001_initial.sql`
2. Criar bucket `post-images` (público) no Supabase Storage
3. Copiar `.env.local.example` → `.env.local` e preencher as chaves
4. Rodar `supabase/seed_agencia.ts` para criar o primeiro usuário da agência
5. Push para GitHub → importar na Vercel → adicionar as 3 variáveis de ambiente
6. Configurar Site URL e Redirect URLs no Supabase Auth

Ver `README.md` para passo a passo detalhado.
