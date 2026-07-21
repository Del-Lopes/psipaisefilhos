-- ============================================================================
--  Módulo Relatórios (persistência) — relatórios gerados e salvos
--  Depende de 01_pacientes.sql (patients) e 02_agenda.sql (sessions).
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- ============================================================================

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  patient_id  uuid not null references public.patients (id) on delete cascade,
  session_id  uuid references public.sessions (id) on delete set null, -- só p/ relatório de sessão
  tipo        text not null,            -- 'sessao' | 'geral'
  titulo      text not null,
  conteudo    text not null,            -- texto final (Markdown) revisado
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists reports_patient_idx on public.reports (patient_id);
create index if not exists reports_owner_idx   on public.reports (owner_id);

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

alter table public.reports enable row level security;

drop policy if exists "reports_owner_all" on public.reports;
create policy "reports_owner_all" on public.reports
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ============================================================================
--  Fim do módulo Relatórios (persistência).
-- ============================================================================
