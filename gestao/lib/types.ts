export type PatientStatus = 'ativo' | 'inativo' | 'alta';

export interface Patient {
  id: string;
  owner_id: string;
  nome: string;
  data_nascimento: string | null; // ISO date (YYYY-MM-DD)
  sexo: string | null;
  escola: string | null;
  ano_escolar: string | null;
  queixa_inicial: string | null;
  observacoes: string | null;
  drive_url: string | null;
  status: PatientStatus;
  created_at: string;
  updated_at: string;
}

export interface Guardian {
  id: string;
  owner_id: string;
  patient_id: string;
  nome: string;
  parentesco: string | null;
  telefone: string | null;
  email: string | null;
  cpf: string | null;
  is_pagante: boolean;
  created_at: string;
  updated_at: string;
}

// Campos editáveis pelo formulário (sem os gerenciados pelo banco).
export type PatientInput = Pick<
  Patient,
  'nome' | 'data_nascimento' | 'sexo' | 'escola' | 'ano_escolar' | 'queixa_inicial' | 'observacoes' | 'drive_url' | 'status'
>;

export type GuardianInput = Pick<
  Guardian,
  'nome' | 'parentesco' | 'telefone' | 'email' | 'cpf' | 'is_pagante'
>;

export type SessionStatus = 'agendada' | 'realizada' | 'faltou' | 'cancelada';

export interface Session {
  id: string;
  owner_id: string;
  patient_id: string;
  inicio: string; // ISO timestamptz
  duracao_min: number;
  status: SessionStatus;
  valor: number | null;
  pago: boolean;
  pago_em: string | null; // ISO date
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

// Sessão com o nome do paciente embutido (join), para exibir na agenda.
export interface SessionWithPatient extends Session {
  patient: Pick<Patient, 'id' | 'nome'> | null;
}

export type SessionInput = Pick<
  Session,
  'patient_id' | 'inicio' | 'duracao_min' | 'status' | 'valor' | 'pago' | 'pago_em' | 'observacoes'
>;

export interface SessionNote {
  session_id: string;
  owner_id: string;
  conteudo: string;
  created_at: string;
  updated_at: string;
}
