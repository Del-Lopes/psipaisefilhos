-- ============================================================================
--  Módulo Financeiro — estende sessions com controle de pagamento
--  Depende de 02_agenda.sql (tabela public.sessions).
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- ============================================================================

-- Pagamento controlado na própria sessão (modelo simples, single-user).
alter table public.sessions
  add column if not exists pago     boolean not null default false,
  add column if not exists pago_em  date;

-- Índice para consultas de "a receber" (não pagas).
create index if not exists sessions_pago_idx on public.sessions (pago);

-- ============================================================================
--  Fim do módulo Financeiro.
-- ============================================================================
