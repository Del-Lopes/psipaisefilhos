import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { listReports, deleteReport } from '../lib/reports';
import type { Report } from '../lib/types';
import { formatDateBR, formatTime } from '../lib/format';

const tipoLabels: Record<string, string> = { sessao: 'Sessão', geral: 'Geral' };

const ReportsSection: React.FC<{ patientId: string; reloadKey?: number }> = ({ patientId, reloadKey }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReports(await listReports(patientId));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load, reloadKey]);

  const handleDelete = async (r: Report) => {
    if (!confirm('Excluir este relatório salvo?')) return;
    await deleteReport(r.id);
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-6">
      <h2 className="font-serif text-lg text-secondary-600 mb-4">Relatórios salvos</h2>
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-secondary-300" /></div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-secondary-400 py-2 text-center">
          Nenhum relatório salvo. Gere um em <strong>Relatório</strong> e clique em <strong>Salvar</strong>.
        </p>
      ) : (
        <div className="divide-y divide-secondary-50">
          {reports.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileBarChart className="h-4 w-4 text-secondary-300 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-secondary-700 truncate">{r.titulo}</p>
                  <p className="text-xs text-secondary-400">
                    {tipoLabels[r.tipo] ?? r.tipo} · {formatDateBR(r.created_at.slice(0, 10))} {formatTime(r.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to={`/app/relatorio/print?id=${r.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-1.5 text-sm font-semibold text-secondary-600 hover:bg-secondary-50"
                >
                  Abrir <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <button onClick={() => handleDelete(r)} className="p-2 text-secondary-300 hover:text-primary-600" aria-label="Excluir relatório">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsSection;
