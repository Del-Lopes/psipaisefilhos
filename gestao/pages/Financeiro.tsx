import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Loader2, Wallet, TrendingUp, Clock, CheckCircle2, Circle,
} from 'lucide-react';
import { listSessionsForMonth, summarize, type FinanceSummary } from '../lib/finance';
import { setSessionPaid } from '../lib/sessions';
import type { SessionWithPatient } from '../lib/types';
import {
  formatBRL, formatDateBR, formatTime, sessionStatusLabels, sessionStatusStyles,
} from '../lib/format';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const SummaryCard: React.FC<{
  label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent: string;
}> = ({ label, value, icon: Icon, accent }) => (
  <div className="bg-white rounded-2xl border border-secondary-100 p-5">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-secondary-400">{label}</p>
      <Icon className={`h-5 w-5 ${accent}`} />
    </div>
    <p className="mt-2 font-serif text-2xl text-secondary-600">{value}</p>
  </div>
);

const Financeiro: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sessions, setSessions] = useState<SessionWithPatient[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSessionsForMonth(year, month);
      setSessions(data);
      setSummary(summarize(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o financeiro.');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };

  const togglePaid = async (s: SessionWithPatient) => {
    setTogglingId(s.id);
    try {
      await setSessionPaid(s.id, !s.pago);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pagamento.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-secondary-600">Financeiro</h1>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="rounded-lg border border-secondary-200 p-2 text-secondary-600 hover:bg-secondary-50" aria-label="Mês anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-secondary-500 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} className="rounded-lg border border-secondary-200 p-2 text-secondary-600 hover:bg-secondary-50" aria-label="Próximo mês">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard label="Recebido no mês" value={formatBRL(summary?.recebido ?? 0)} icon={TrendingUp} accent="text-nature-500" />
            <SummaryCard label="A receber (realizadas)" value={formatBRL(summary?.aReceber ?? 0)} icon={Clock} accent="text-primary-500" />
            <SummaryCard label="Previsto (agendadas)" value={formatBRL(summary?.previsto ?? 0)} icon={Wallet} accent="text-secondary-400" />
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-secondary-100 p-10 flex flex-col items-center text-center">
              <Wallet className="h-10 w-10 text-secondary-300" />
              <p className="mt-3 text-secondary-500 font-semibold">Nenhuma sessão neste mês</p>
              <p className="text-sm text-secondary-400 mt-1">
                Sessões com valor aparecem aqui. Cadastre na <Link to="/app/agenda" className="underline">agenda</Link>.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-secondary-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50 text-secondary-400">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Data</th>
                    <th className="text-left font-semibold px-4 py-3">Paciente</th>
                    <th className="text-left font-semibold px-4 py-3 hidden sm:table-cell">Status</th>
                    <th className="text-right font-semibold px-4 py-3">Valor</th>
                    <th className="text-center font-semibold px-4 py-3">Pago</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-50">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-secondary-50/50">
                      <td className="px-4 py-3 text-secondary-600 whitespace-nowrap">
                        {formatDateBR(s.inicio.slice(0, 10))}
                        <span className="text-secondary-400"> · {formatTime(s.inicio)}</span>
                      </td>
                      <td className="px-4 py-3 text-secondary-700">{s.patient?.nome ?? '—'}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${sessionStatusStyles[s.status]}`}>
                          {sessionStatusLabels[s.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-secondary-700 whitespace-nowrap">{formatBRL(s.valor)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => togglePaid(s)}
                          disabled={togglingId === s.id}
                          className="inline-flex items-center justify-center text-secondary-400 hover:text-nature-600 disabled:opacity-50"
                          aria-label={s.pago ? 'Marcar como não pago' : 'Marcar como pago'}
                        >
                          {togglingId === s.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : s.pago ? (
                            <CheckCircle2 className="h-5 w-5 text-nature-600" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {summary && summary.pendentesCount > 0 && (
            <p className="text-sm text-secondary-400">
              {summary.pendentesCount} sessão(ões) realizada(s) ainda sem pagamento neste mês.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Financeiro;
