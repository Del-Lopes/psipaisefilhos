import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Loader2, CalendarDays } from 'lucide-react';
import { listSessions, createSession, updateSession, deleteSession } from '../lib/sessions';
import type { SessionWithPatient, SessionInput } from '../lib/types';
import {
  startOfWeek, addDays, weekdayLabels, formatTime,
  sessionStatusLabels, sessionStatusStyles,
} from '../lib/format';
import SessionForm from '../components/SessionForm';

type ModalState =
  | { mode: 'closed' }
  | { mode: 'create'; start: Date }
  | { mode: 'edit'; session: SessionWithPatient };

const Agenda: React.FC = () => {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [sessions, setSessions] = useState<SessionWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ mode: 'closed' });

  const weekEnd = addDays(weekStart, 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSessions(await listSessions(weekStart.toISOString(), weekEnd.toISOString()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar a agenda.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const sessionsForDay = (day: Date) => {
    const y = day.getFullYear(), m = day.getMonth(), d = day.getDate();
    return sessions.filter((s) => {
      const dt = new Date(s.inicio);
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
    });
  };

  const handleSubmit = async (input: SessionInput) => {
    if (modal.mode === 'edit') await updateSession(modal.session.id, input);
    else await createSession(input);
    setModal({ mode: 'closed' });
    load();
  };

  const handleDelete = async () => {
    if (modal.mode !== 'edit') return;
    if (!confirm('Excluir esta sessão?')) return;
    await deleteSession(modal.session.id);
    setModal({ mode: 'closed' });
    load();
  };

  const isToday = (d: Date) => {
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
  };

  const rangeLabel = `${weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${addDays(
    weekStart, 6
  ).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-secondary-600">Agenda</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="rounded-lg border border-secondary-200 p-2 text-secondary-600 hover:bg-secondary-50" aria-label="Semana anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="rounded-lg border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50">
            Hoje
          </button>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="rounded-lg border border-secondary-200 p-2 text-secondary-600 hover:bg-secondary-50" aria-label="Próxima semana">
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-secondary-500 ml-1">{rangeLabel}</span>
          <button
            onClick={() => {
              const start = new Date(weekStart);
              start.setHours(8, 0, 0, 0);
              setModal({ mode: 'create', start });
            }}
            className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 ml-2"
          >
            <Plus className="h-4 w-4" /> Nova sessão
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {days.map((day, i) => {
            const daySessions = sessionsForDay(day);
            return (
              <div key={i} className="bg-white rounded-2xl border border-secondary-100 flex flex-col min-h-[140px]">
                <div className={`px-3 py-2 border-b border-secondary-50 flex items-center justify-between ${isToday(day) ? 'bg-secondary-50 rounded-t-2xl' : ''}`}>
                  <div>
                    <span className="text-xs font-semibold text-secondary-400">{weekdayLabels[i]}</span>{' '}
                    <span className={`text-sm font-semibold ${isToday(day) ? 'text-secondary-700' : 'text-secondary-500'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const start = new Date(day);
                      start.setHours(8, 0, 0, 0);
                      setModal({ mode: 'create', start });
                    }}
                    className="text-secondary-300 hover:text-secondary-600"
                    aria-label="Adicionar sessão neste dia"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-2 space-y-2 flex-1">
                  {daySessions.length === 0 ? (
                    <p className="text-xs text-secondary-300 text-center py-3">—</p>
                  ) : (
                    daySessions.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setModal({ mode: 'edit', session: s })}
                        className={`w-full text-left rounded-lg border px-2.5 py-2 text-xs ${sessionStatusStyles[s.status]}`}
                      >
                        <span className="font-semibold block">{formatTime(s.inicio)}</span>
                        <span className="block truncate">{s.patient?.nome ?? 'Paciente removido'}</span>
                        <span className="block opacity-70">{sessionStatusLabels[s.status]}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="bg-white rounded-2xl border border-secondary-100 p-6 flex items-center gap-3 text-sm text-secondary-500">
          <CalendarDays className="h-5 w-5 text-secondary-300 shrink-0" />
          <span>Nenhuma sessão nesta semana. Clique em <strong>Nova sessão</strong> ou no “+” de um dia. Precisa de <Link to="/app/pacientes" className="underline">pacientes cadastrados</Link> primeiro.</span>
        </div>
      )}

      {modal.mode === 'create' && (
        <SessionForm defaultStart={modal.start} onCancel={() => setModal({ mode: 'closed' })} onSubmit={handleSubmit} />
      )}
      {modal.mode === 'edit' && (
        <SessionForm initial={modal.session} onCancel={() => setModal({ mode: 'closed' })} onSubmit={handleSubmit} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Agenda;
