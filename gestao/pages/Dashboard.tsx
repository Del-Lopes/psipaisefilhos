import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Users, Wallet, AlertCircle, Loader2, ArrowRight, Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadDashboard, type DashboardData } from '../lib/dashboard';
import {
  formatBRL, formatTime, sessionStatusLabels, sessionStatusStyles,
} from '../lib/format';

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  accent: string;
}> = ({ label, value, icon: Icon, to, accent }) => (
  <Link to={to} className="bg-white rounded-2xl border border-secondary-100 p-5 hover:border-secondary-300 transition-colors">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-secondary-400">{label}</p>
      <Icon className={`h-5 w-5 ${accent}`} />
    </div>
    <p className="mt-2 font-serif text-2xl text-secondary-600">{value}</p>
  </Link>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar o painel.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-secondary-600">Olá, Bárbara </h1>
        <p className="text-sm text-secondary-400">Bem-vinda à sua central de organização.</p>
      </div>

      {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Sessões hoje" value={String(data.sessoesHoje.length)} icon={CalendarDays} to="/app/agenda" accent="text-secondary-400" />
            <StatCard label="Pacientes ativos" value={String(data.pacientesAtivos)} icon={Users} to="/app/pacientes" accent="text-nature-500" />
            <StatCard label="A receber (mês)" value={formatBRL(data.aReceberMes)} icon={Wallet} to="/app/financeiro" accent="text-primary-500" />
            <StatCard label="Pagamentos pendentes" value={String(data.pendentesMes)} icon={AlertCircle} to="/app/financeiro" accent="text-accent-600" />
          </div>

          {/* Sessões de hoje */}
          <div className="bg-white rounded-2xl border border-secondary-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg text-secondary-600">Sessões de hoje</h2>
              <Link to="/app/agenda" className="flex items-center gap-1 text-sm text-secondary-500 hover:underline">
                Agenda <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {data.sessoesHoje.length === 0 ? (
              <p className="text-sm text-secondary-400 py-6 text-center">Nenhuma sessão agendada para hoje. 🌤️</p>
            ) : (
              <div className="divide-y divide-secondary-50">
                {data.sessoesHoje.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-secondary-700 min-w-[64px]">
                        <Clock className="h-4 w-4 text-secondary-300" /> {formatTime(s.inicio)}
                      </span>
                      <span className="text-secondary-700">{s.patient?.nome ?? 'Paciente removido'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-secondary-400 hidden sm:inline">{formatBRL(s.valor)}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${sessionStatusStyles[s.status]}`}>
                        {sessionStatusLabels[s.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-secondary-400">
            Conectado como <span className="font-semibold">{user?.email}</span>
          </p>
        </>
      ) : null}
    </div>
  );
};

export default Dashboard;
