import type { PatientStatus, SessionStatus } from './types';

/** Calcula idade (anos) a partir de uma data ISO YYYY-MM-DD. */
export function calcAge(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const birth = new Date(isoDate + 'T00:00:00');
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

/** Formata data ISO para pt-BR (DD/MM/AAAA). */
export function formatDateBR(isoDate: string | null): string {
  if (!isoDate) return '—';
  const d = new Date(isoDate + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export const statusLabels: Record<PatientStatus, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  alta: 'Alta',
};

export const statusStyles: Record<PatientStatus, string> = {
  ativo: 'bg-nature-100 text-nature-800',
  inativo: 'bg-secondary-100 text-secondary-600',
  alta: 'bg-accent-100 text-accent-800',
};

// --- Sessões ---------------------------------------------------------------

export const sessionStatusLabels: Record<SessionStatus, string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  faltou: 'Faltou',
  cancelada: 'Cancelada',
};

export const sessionStatusStyles: Record<SessionStatus, string> = {
  agendada: 'bg-secondary-100 text-secondary-700 border-secondary-300',
  realizada: 'bg-nature-100 text-nature-800 border-nature-300',
  faltou: 'bg-primary-100 text-primary-700 border-primary-300',
  cancelada: 'bg-secondary-50 text-secondary-400 border-secondary-200 line-through',
};

/** Formata um timestamp ISO para "HH:MM" (pt-BR, fuso local). */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Formata moeda BRL; retorna '—' se nulo. */
export function formatBRL(value: number | null): string {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Segunda-feira (00:00 local) da semana que contém `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=dom ... 6=sáb
  const diff = day === 0 ? -6 : 1 - day; // recua até segunda
  d.setDate(d.getDate() + diff);
  return d;
}

/** Adiciona `days` dias a uma data (nova instância). */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export const weekdayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

/** "datetime-local" (YYYY-MM-DDTHH:MM) a partir de um Date, em fuso local. */
export function toDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
