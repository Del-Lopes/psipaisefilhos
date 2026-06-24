-- ============================================================================
--  Módulo Evolução Clínica — anotações por sessão (dado clínico SENSÍVEL)
--  Depende de 02_agenda.sql (tabela public.sessions).
--  Sigilo profissional (CFP): tabela separada, RLS restrita ao dono.
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- ============================================================================

-- Uma anotação de evolução por sessão (1:1). A sessão é a "chave" clínica.
create table if not exists public.session_notes (
  session_id   uuid primary key references public.sessions (id) on delete cascade,
  owner_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  conteudo     text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists session_notes_owner_idx on public.session_notes (owner_id);

drop trigger if exists session_notes_set_updated_at on public.session_notes;
create trigger session_notes_set_updated_at
  before update on public.session_notes
  for each row execute function public.set_updated_at();

alter table public.session_notes enable row level security;

drop policy if exists "session_notes_owner_all" on public.session_notes;
create policy "session_notes_owner_all" on public.session_notes
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ============================================================================
--  Fim do módulo Evolução Clínica.
-- ============================================================================
