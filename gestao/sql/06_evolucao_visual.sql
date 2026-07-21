-- ============================================================================
--  Módulo Evolução Visual — indicadores clínicos, pontuações e objetivos
--  Depende de 01_pacientes.sql e 02_agenda.sql (patients, sessions, set_updated_at).
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- (A) indicators — indicadores clínicos personalizados por paciente
--     Ex.: "Ansiedade", "Foco", "Sono", "Interação social"
-- ----------------------------------------------------------------------------
create table if not exists public.indicators (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id  uuid not null references public.patients (id) on delete cascade,
  nome        text not null,
  escala_min  integer not null default 0,
  escala_max  integer not null default 10,
  cor         text,                          -- cor da linha no gráfico (hex)
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists indicators_patient_idx on public.indicators (patient_id);
create index if not exists indicators_owner_idx   on public.indicators (owner_id);

drop trigger if exists indicators_set_updated_at on public.indicators;
create trigger indicators_set_updated_at
  before update on public.indicators
  for each row execute function public.set_updated_at();

alter table public.indicators enable row level security;

drop policy if exists "indicators_owner_all" on public.indicators;
create policy "indicators_owner_all" on public.indicators
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- (B) indicator_scores — pontuação de cada indicador em cada sessão
--     (a série temporal que alimenta o gráfico de evolução)
-- ----------------------------------------------------------------------------
create table if not exists public.indicator_scores (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  indicator_id  uuid not null references public.indicators (id) on delete cascade,
  session_id    uuid not null references public.sessions (id) on delete cascade,
  valor         numeric(5,2) not null,
  created_at    timestamptz not null default now(),
  unique (indicator_id, session_id)          -- 1 nota por indicador por sessão
);

create index if not exists indicator_scores_indicator_idx on public.indicator_scores (indicator_id);
create index if not exists indicator_scores_session_idx   on public.indicator_scores (session_id);
create index if not exists indicator_scores_owner_idx     on public.indicator_scores (owner_id);

alter table public.indicator_scores enable row level security;

drop policy if exists "indicator_scores_owner_all" on public.indicator_scores;
create policy "indicator_scores_owner_all" on public.indicator_scores
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- (C) goals — marcos/objetivos terapêuticos do paciente
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.goal_status as enum ('em_andamento', 'atingido', 'pausado');
exception when duplicate_object then null; end $$;

create table if not exists public.goals (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id    uuid not null references public.patients (id) on delete cascade,
  titulo        text not null,
  descricao     text,
  status        public.goal_status not null default 'em_andamento',
  atingido_em   date,
  ordem         integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists goals_patient_idx on public.goals (patient_id);
create index if not exists goals_owner_idx   on public.goals (owner_id);

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

alter table public.goals enable row level security;

drop policy if exists "goals_owner_all" on public.goals;
create policy "goals_owner_all" on public.goals
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ============================================================================
--  Fim do módulo Evolução Visual.
-- ============================================================================
