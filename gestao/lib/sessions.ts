import { supabase } from './supabase';
import type { Session, SessionInput, SessionWithPatient } from './types';

/** Lista sessões num intervalo [from, to), com o nome do paciente (join). */
export async function listSessions(fromISO: string, toISO: string): Promise<SessionWithPatient[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*, patient:patients(id, nome)')
    .gte('inicio', fromISO)
    .lt('inicio', toISO)
    .order('inicio', { ascending: true });
  if (error) throw error;
  return data as unknown as SessionWithPatient[];
}

/** Lista sessões de um paciente específico (mais recentes primeiro). */
export async function listSessionsByPatient(patientId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('inicio', { ascending: false });
  if (error) throw error;
  return data as Session[];
}

export async function createSession(input: SessionInput): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Session;
}

export async function updateSession(id: string, input: Partial<SessionInput>): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Session;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) throw error;
}

/** Marca/desmarca uma sessão como paga. Ao marcar, registra a data (hoje). */
export async function setSessionPaid(id: string, pago: boolean): Promise<Session> {
  const pago_em = pago ? new Date().toISOString().slice(0, 10) : null;
  const { data, error } = await supabase
    .from('sessions')
    .update({ pago, pago_em })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Session;
}
