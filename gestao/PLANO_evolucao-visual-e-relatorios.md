# Plano de Implementação — Evolução Visual & Relatórios com IA

> Documento orientador. Guia a implementação passo a passo das duas novas features.
> Contexto do app: SPA React 19 + Vite + Tailwind (CDN), Supabase (Postgres + Auth + RLS),
> single-user (a psicóloga), PWA, deploy Vercel. Código do app em `gestao/`.
> **Ler antes:** `MEMORY.md` do projeto e os SQLs em `gestao/sql/`.

---

## Decisões já tomadas (não reabrir sem o usuário)

| Tema | Decisão |
|---|---|
| Evolução visual — o quê | Indicadores clínicos personalizados + Marcos/objetivos + Frequência/assiduidade |
| Relatórios — tipos | Relatório de **sessão** e relatório **geral do paciente** |
| Relatórios — texto | Gerado por **IA (Google Gemini)** com base nos dados preenchidos |
| IA — papel | **Rascunho**: a IA gera, a psicóloga SEMPRE revisa/edita antes de exportar |
| IA — arquitetura | **Supabase Edge Function** guarda a chave e faz a chamada (chave NUNCA no front) |
| PDF — técnica | **Print-to-PDF** do navegador (`window.print()` + CSS `@media print`), sem libs |
| Privacidade | Dado clínico é sigiloso (LGPD/CFP). Enviar à IA só o necessário; documentar consentimento |

---

## Convenções do projeto (seguir à risca)

- Pasta do app é **`gestao/`** (não `app/`); arquivo raiz é **`Root.tsx`** (não `App.tsx`) — colisão no Windows.
- Camada de dados em `gestao/lib/*.ts`; páginas em `gestao/pages/`; componentes em `gestao/components/`.
- SQL de cada módulo em `gestao/sql/NN_*.sql`, **rodado manualmente** no Supabase SQL Editor.
- Toda tabela nova: `owner_id uuid default auth.uid()`, RLS habilitada, policy `for all using/with check (auth.uid() = owner_id)`, trigger `set_updated_at`.
- Cores Tailwind: `primary` (coral), `secondary` (verde escuro), `nature`, `accent`. Fontes: serif=Merriweather, sans=Nunito Sans.
- Sempre validar com `npm run build` antes de considerar pronto. Commit só quando o usuário pedir.

---

# FEATURE 1 — Evolução Visual do Paciente

Objetivo: na ficha do paciente, uma aba/seção "Evolução" com gráficos de progresso ao
longo do tratamento, baseada em (a) indicadores clínicos personalizados pontuados por sessão,
(b) marcos/objetivos terapêuticos, (c) frequência/assiduidade (dados já existentes).

## 1.1 — Banco de dados  →  `gestao/sql/06_evolucao_visual.sql`

Três estruturas novas:

```sql
-- (A) Indicadores clínicos personalizados definidos pela psicóloga
--     Ex.: "Ansiedade", "Foco", "Sono", "Interação social"
create table public.indicators (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  patient_id  uuid not null references public.patients(id) on delete cascade,
  nome        text not null,
  escala_min  integer not null default 0,
  escala_max  integer not null default 10,
  cor         text,                      -- cor da linha no gráfico (hex)
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- (B) Pontuação de cada indicador em cada sessão (a série temporal do gráfico)
create table public.indicator_scores (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade default auth.uid(),
  indicator_id  uuid not null references public.indicators(id) on delete cascade,
  session_id    uuid not null references public.sessions(id) on delete cascade,
  valor         numeric(5,2) not null,
  created_at    timestamptz not null default now(),
  unique (indicator_id, session_id)      -- 1 nota por indicador por sessão
);

-- (C) Marcos/objetivos terapêuticos
create table public.goals (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade default auth.uid(),
  patient_id    uuid not null references public.patients(id) on delete cascade,
  titulo        text not null,
  descricao     text,
  status        text not null default 'em_andamento', -- em_andamento | atingido | pausado
  atingido_em   date,
  ordem         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

Para cada tabela: habilitar RLS + policy `owner_all` + trigger `set_updated_at` (copiar padrão
dos SQLs existentes). Índices por `patient_id` e, em `indicator_scores`, por `session_id`.
Enum de `goals.status` pode ser `text` com CHECK ou enum próprio (seguir estilo dos existentes = enum).

**Lembrete:** atualizar também `gestao/sql/00_full_setup.sql` com essas tabelas (manter o consolidado fiel).

## 1.2 — Tipos  →  `gestao/lib/types.ts`

Adicionar interfaces `Indicator`, `IndicatorScore`, `Goal` + os `*Input` (Pick dos campos editáveis),
seguindo o padrão das interfaces existentes.

## 1.3 — Camada de dados  →  `gestao/lib/evolution.ts` (novo)

Funções:
- `listIndicators(patientId)`, `createIndicator`, `updateIndicator`, `deleteIndicator`
- `scoresForPatient(patientId)` — join indicator_scores + sessions(inicio) ordenado por data (série p/ gráfico)
- `saveScore(indicatorId, sessionId, valor)` — upsert por `(indicator_id, session_id)`
- `listGoals(patientId)`, `createGoal`, `updateGoal` (mudar status/atingido_em), `deleteGoal`
- `attendanceStats(patientId)` — agrega sessions: total, realizadas, faltas, canceladas, série mensal

## 1.4 — Biblioteca de gráficos (decisão)

O projeto usa Tailwind via CDN e o bundle já passou de 500kB. Duas opções:
- **Opção A (recomendada):** gráficos SVG feitos à mão (line chart + barras simples). Zero dependência,
  controle total do visual, alinhado ao design. Suficiente para line/bar/progress.
- **Opção B:** `recharts` (~ leve, React-friendly). Mais rápido de montar, mas +bundle.
→ Começar pela **A** (componente `gestao/components/charts/LineChart.tsx` e `BarChart.tsx` minimalistas).
  Se a necessidade crescer, migrar para recharts.

## 1.5 — UI  →  ficha do paciente (`gestao/pages/PatientDetail.tsx`)

Adicionar seção/aba **"Evolução"** com:
1. **Indicadores**: gerenciar (CRUD) os indicadores do paciente; para cada sessão, permitir pontuar
   (form rápido). Gráfico multi-linha: eixo X = datas das sessões, uma linha por indicador (usa `cor`).
2. **Objetivos**: lista de metas com status; botão "marcar como atingido" (registra `atingido_em`);
   barra de progresso (atingidos / total).
3. **Frequência**: cards (total sessões, % comparecimento, nº faltas) + gráfico de barras mensal
   (realizadas vs faltas).

Onde pontuar indicadores: idealmente no **SessionNoteModal** (já aberto ao registrar evolução da sessão)
— adicionar ali os campos de pontuação dos indicadores ativos daquele paciente. Assim ela pontua no
mesmo fluxo em que escreve a evolução.

## 1.6 — Passos de implementação (ordem)

1. SQL `06_evolucao_visual.sql` + atualizar `00_full_setup.sql` → rodar no Supabase.
2. Tipos em `types.ts`.
3. `gestao/lib/evolution.ts`.
4. Componentes de gráfico SVG (`charts/`).
5. CRUD de indicadores e objetivos (modais, seguindo padrão `PatientForm`/`GuardianForm`).
6. Integrar pontuação no `SessionNoteModal`.
7. Seção "Evolução" na `PatientDetail` com os 3 blocos.
8. `npm run build` + teste manual.

---

# FEATURE 2 — Relatórios Exportáveis (PDF) com IA

Objetivo: gerar dois tipos de relatório cujo **texto** é redigido por IA (Gemini) a partir dos
dados do paciente/sessões, apresentado como **rascunho editável**, e exportável em PDF via impressão.

- **Relatório de sessão**: uma sessão específica (dados do paciente + data + evolução + indicadores daquela sessão).
- **Relatório geral do paciente**: consolidado (dados, responsáveis, sessões, evoluções, indicadores, objetivos, frequência).

## 2.1 — Arquitetura da IA (segurança é o ponto central)

```
Front (SPA)  ──►  Supabase Edge Function "gerar-relatorio"  ──►  Google Gemini API
   │                    (guarda GEMINI_API_KEY como secret)          │
   └──────────────  recebe o texto-rascunho de volta  ◄─────────────┘
```

**Por que Edge Function:** a chave da IA NUNCA pode ir para o front (ficaria pública no bundle).
A função roda no servidor, autentica o usuário (JWT do Supabase), monta o prompt e chama o Gemini.

**Privacidade/LGPD:** enviar à IA apenas os campos necessários. Deixar explícito na UI que o texto é
rascunho gerado por IA e que a responsável clínica revisa. Não logar o conteúdo clínico na função.

## 2.2 — Supabase Edge Function  →  `supabase/functions/gerar-relatorio/index.ts` (novo)

- Runtime Deno (padrão Supabase). Recebe: `{ tipo: 'sessao' | 'geral', payload: {...dados...}, template: string }`.
- Valida o JWT (a função deve exigir usuário autenticado — usar `verify_jwt`).
- Monta o prompt: **instruções de formato (o "template" que a psicóloga cadastra)** + dados do paciente.
- Chama Gemini (`gemini-1.5-flash` ou similar) via REST com a `GEMINI_API_KEY` (secret da função).
- Retorna `{ texto: string }`.

Secrets: `supabase secrets set GEMINI_API_KEY=...` (CLI) — NÃO usar a var do front.

Deploy: `supabase functions deploy gerar-relatorio`.
> Requer Supabase CLI instalado e login. Documentar no README de setup.

## 2.3 — Template do relatório (cadastrável pela psicóloga)

A usuária quer "treinar" o formato de saída. Implementar como **template de prompt editável**:

`gestao/sql/07_relatorios.sql`:
```sql
create table public.report_templates (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  tipo        text not null,            -- 'sessao' | 'geral'
  nome        text not null,
  instrucoes  text not null,            -- o "treinamento": como a IA deve escrever/estruturar
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- RLS owner_all + trigger updated_at. Atualizar 00_full_setup.sql.
```

Também guardar os dados da emitente para o cabeçalho do relatório (nome, CRP, CPF/CNPJ) —
pode ir na tabela `profiles` (adicionar colunas `crp`, `documento`, `endereco`) ou numa
config única. Necessário para o rodapé/cabeçalho do documento.

## 2.4 — Camada de dados  →  `gestao/lib/reports.ts` (novo)

- `listTemplates(tipo)`, `saveTemplate`, `deleteTemplate`
- `buildSessionPayload(sessionId)` — monta o objeto de dados de uma sessão (paciente, evolução, indicadores)
- `buildGeneralPayload(patientId)` — consolida tudo do paciente
- `generateReport(tipo, payload, templateInstrucoes)` — chama a Edge Function via `supabase.functions.invoke`

## 2.5 — UI

1. **Configuração de templates** (nova página ou seção em Configurações): a psicóloga cria/edita
   os textos de "instrução" para a IA (o formato desejado), por tipo. Também cadastra CRP/dados da emitente.
2. **Gerar relatório**:
   - Botão "Gerar relatório" na ficha do paciente (geral) e no `SessionNoteModal`/sessão (de sessão).
   - Fluxo: escolhe template → chama IA (loading) → mostra o **rascunho num editor de texto**
     (textarea rico ou simples) → ela **revisa/edita** → botão "Exportar PDF".
3. **Página de impressão** (`gestao/pages/ReportPrint.tsx` ou componente): layout limpo com
   cabeçalho (logo + dados da emitente), corpo (texto revisado), rodapé (CRP, data, assinatura).
   CSS `@media print` esconde a navegação e formata A4. `window.print()` gera o PDF.

## 2.6 — Passos de implementação (ordem)

1. SQL `07_relatorios.sql` (+ colunas emitente em profiles) + atualizar `00_full_setup.sql` → rodar.
2. Setup Supabase CLI + criar a Edge Function `gerar-relatorio` + secret da chave Gemini + deploy.
3. Testar a função isolada (invoke com payload de exemplo).
4. Tipos + `gestao/lib/reports.ts`.
5. UI de templates + dados da emitente.
6. Fluxo de geração (rascunho editável) na ficha e na sessão.
7. Componente/página de impressão com `@media print` + `window.print()`.
8. `npm run build` + teste do fluxo ponta a ponta (gerar → editar → exportar).

## 2.7 — Riscos e cuidados

- **Alucinação da IA num documento clínico**: por isso o texto é sempre rascunho revisável. Deixar aviso visível.
- **Chave Gemini**: só na Edge Function (secret). Conferir que não vaza para o bundle.
- **Custo/erros da API**: tratar timeout/erro da função com mensagem amigável e permitir tentar de novo.
- **PWA + impressão**: testar `window.print()` dentro do app instalado (standalone) — em alguns
  navegadores o comportamento muda; ter fallback (abrir a página de impressão em aba normal).
- **iOS Safari**: print-to-PDF funciona via "Compartilhar → Imprimir → pinçar para PDF"; validar.

---

## Dependências entre as features

- Feature 2 (relatório) fica **mais rica** se a Feature 1 já existir (indicadores/objetivos entram no relatório).
- **Ordem recomendada:** implementar **Feature 1 primeiro**, depois Feature 2 — assim o relatório
  geral já pode incluir os gráficos/indicadores. Mas são independentes; podem ser feitas em separado.

## Checklist de "pronto" (Definition of Done) por feature

- [ ] SQL rodado no Supabase + `00_full_setup.sql` atualizado
- [ ] RLS testada (dados só aparecem para o dono)
- [ ] `npm run build` sem erros
- [ ] Teste manual do fluxo completo no `/app`
- [ ] (Feature 2) Edge Function deployada e chave protegida
- [ ] Memória do projeto atualizada com o que foi construído
```
