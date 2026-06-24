import { supabase } from './supabase';
import type { Patient, PatientInput, Guardian, GuardianInput } from './types';

// --- Pacientes -------------------------------------------------------------

export async function listPatients(search = ''): Promise<Patient[]> {
  let query = supabase
    .from('patients')
    .select('*')
    .order('nome', { ascending: true });

  if (search.trim()) {
    query = query.ilike('nome', `%${search.trim()}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Patient[];
}

/** Pacientes que têm uma pasta de documentos (drive_url) vinculada. */
export async function listPatientsWithDocs(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .not('drive_url', 'is', null)
    .order('nome', { ascending: true });
  if (error) throw error;
  return data as Patient[];
}

export async function getPatient(id: string): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function createPatient(input: PatientInput): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function updatePatient(id: string, input: Partial<PatientInput>): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) throw error;
}

// --- Responsáveis ----------------------------------------------------------

export async function listGuardians(patientId: string): Promise<Guardian[]> {
  const { data, error } = await supabase
    .from('guardians')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Guardian[];
}

export async function createGuardian(
  patientId: string,
  input: GuardianInput
): Promise<Guardian> {
  const { data, error } = await supabase
    .from('guardians')
    .insert({ ...input, patient_id: patientId })
    .select()
    .single();
  if (error) throw error;
  return data as Guardian;
}

export async function updateGuardian(
  id: string,
  input: Partial<GuardianInput>
): Promise<Guardian> {
  const { data, error } = await supabase
    .from('guardians')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Guardian;
}

export async function deleteGuardian(id: string): Promise<void> {
  const { error } = await supabase.from('guardians').delete().eq('id', id);
  if (error) throw error;
}
