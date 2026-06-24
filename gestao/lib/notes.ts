import { supabase } from './supabase';
import type { SessionNote } from './types';

/** Anotação de evolução de uma sessão; null se ainda não foi escrita. */
export async function getNote(sessionId: string): Promise<SessionNote | null> {
  const { data, error } = await supabase
    .from('session_notes')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (error) throw error;
  return (data as SessionNote) ?? null;
}

/** Cria ou atualiza a anotação da sessão (upsert pela PK session_id). */
export async function saveNote(sessionId: string, conteudo: string): Promise<SessionNote> {
  const { data, error } = await supabase
    .from('session_notes')
    .upsert({ session_id: sessionId, conteudo }, { onConflict: 'session_id' })
    .select()
    .single();
  if (error) throw error;
  return data as SessionNote;
}

export async function deleteNote(sessionId: string): Promise<void> {
  const { error } = await supabase.from('session_notes').delete().eq('session_id', sessionId);
  if (error) throw error;
}

/** IDs das sessões (entre as informadas) que possuem evolução com conteúdo. */
export async function sessionsWithNotes(sessionIds: string[]): Promise<Set<string>> {
  if (sessionIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('session_notes')
    .select('session_id, conteudo')
    .in('session_id', sessionIds);
  if (error) throw error;
  return new Set(
    (data as Pick<SessionNote, 'session_id' | 'conteudo'>[])
      .filter((n) => n.conteudo.trim().length > 0)
      .map((n) => n.session_id)
  );
}
