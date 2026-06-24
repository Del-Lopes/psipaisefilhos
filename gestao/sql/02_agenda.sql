-- ============================================================================
--  Módulo Agenda — schema + RLS
--  Depende de 01_pacientes.sql (usa public.patients e public.set_updated_at).
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- sessions — sessões/consultas agendadas
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.session_status as enum ('agendada', 'realizada', 'faltou', 'cancelada');
exception when duplicate_object then null; end $$;

create table if not exists public.sessions (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id    uuid not null references public.patients (id) on delete cascade,
  inicio        timestamptz not null,                  -- data/hora de início
  duracao_min   integer not null default 50,           -- duração em minutos
  status        public.session_status not null default 'agendada',
  valor         numeric(10,2),                         -- valor da sessão (financeiro)
  observacoes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists sessions_owner_idx   on public.sessions (owner_id);
create index if not exists sessions_patient_idx on public.sessions (patient_id);
create index if not exists sessions_inicio_idx  on public.sessions (inicio);

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

alter table public.sessions enable row level security;

drop policy if exists "sessions_owner_all" on public.sessions;
create policy "sessions_owner_all" on public.sessions
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ============================================================================
--  Fim do módulo Agenda.
-- ============================================================================
