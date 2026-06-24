-- ============================================================================
--  Módulo Documentos — link para pasta externa (Google Drive) por paciente
--  Depende de 01_pacientes.sql (tabela public.patients).
--  Sem upload/integração: guarda apenas a URL da pasta de documentos.
--  Rodar no Supabase: SQL Editor > New query > colar tudo > Run
-- ============================================================================

alter table public.patients
  add column if not exists drive_url text;  -- link da pasta do paciente no Drive

-- ============================================================================
--  Fim do módulo Documentos.
-- ============================================================================
