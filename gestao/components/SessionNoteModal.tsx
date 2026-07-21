import React, { useEffect, useState } from 'react';
import { X, Loader2, Save, FileText } from 'lucide-react';
import { getNote, saveNote } from '../lib/notes';
import { listIndicators, scoresForSession, saveScore } from '../lib/evolution';
import type { Indicator } from '../lib/types';
import { formatDateBR, formatTime } from '../lib/format';

interface Props {
  sessionId: string;
  patientName: string;
  inicioISO: string;
  patientId?: string; // se informado, permite pontuar os indicadores nesta sessão
  onClose: () => void;
  onSaved?: () => void; // permite à tela-pai recarregar indicadores
}

const SessionNoteModal: React.FC<Props> = ({ sessionId, patientName, inicioISO, patientId, onClose, onSaved }) => {
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [scoreValues, setScoreValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const tasks: Promise<unknown>[] = [
      getNote(sessionId).then((n) => {
        setConteudo(n?.conteudo ?? '');
        setSavedAt(n?.updated_at ?? null);
      }),
    ];
    if (patientId) {
      tasks.push(
        Promise.all([listIndicators(patientId), scoresForSession(sessionId)]).then(([inds, sc]) => {
          setIndicators(inds.filter((i) => i.ativo));
          const vals: Record<string, string> = {};
          for (const [k, v] of Object.entries(sc)) vals[k] = String(v);
          setScoreValues(vals);
        })
      );
    }
    Promise.all(tasks)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar a evolução.'))
      .finally(() => setLoading(false));
  }, [sessionId, patientId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const n = await saveNote(sessionId, conteudo);
      // Salva as pontuações preenchidas dos indicadores.
      for (const ind of indicators) {
        const raw = scoreValues[ind.id];
        if (raw !== undefined && raw !== '') {
          await saveScore(ind.id, sessionId, Number(raw.replace(',', '.')));
        }
      }
      setSavedAt(n.updated_at);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-secondary-400 shrink-0" />
            <div className="min-w-0">
              <h2 className="font-serif text-lg text-secondary-600 truncate">Evolução · {patientName}</h2>
              <p className="text-xs text-secondary-400">
                {formatDateBR(inicioISO.slice(0, 10))} · {formatTime(inicioISO)}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-secondary-400 hover:text-secondary-600 shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>
          ) : (
            <>
              <p className="mb-2 text-xs text-secondary-400">
                Registro clínico desta sessão. Conteúdo sigiloso — visível apenas para você.
              </p>
              <textarea
                className="w-full rounded-lg border border-secondary-200 px-3 py-3 text-secondary-700 leading-relaxed focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 min-h-[280px]"
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                placeholder="Descreva o que foi trabalhado na sessão, observações sobre a criança, encaminhamentos, próximos passos..."
                autoFocus
              />

              {indicators.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-sm font-semibold text-secondary-600">Indicadores desta sessão</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {indicators.map((ind) => (
                      <label key={ind.id} className="flex items-center justify-between gap-3 rounded-lg border border-secondary-100 px-3 py-2">
                        <span className="flex items-center gap-2 text-sm text-secondary-600">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ind.cor ?? '#4B5945' }} />
                          {ind.nome}
                        </span>
                        <input
                          type="number"
                          min={ind.escala_min}
                          max={ind.escala_max}
                          value={scoreValues[ind.id] ?? ''}
                          onChange={(e) => setScoreValues((v) => ({ ...v, [ind.id]: e.target.value }))}
                          placeholder={`${ind.escala_min}–${ind.escala_max}`}
                          className="w-20 rounded-lg border border-secondary-200 px-2 py-1 text-right text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="mt-3 text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-secondary-100 px-6 py-4">
          <span className="text-xs text-secondary-400">
            {savedAt ? `Salvo em ${formatDateBR(savedAt.slice(0, 10))} ${formatTime(savedAt)}` : 'Ainda não salvo'}
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50">
              Fechar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar evolução
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionNoteModal;
