import React, { useEffect, useState } from 'react';
import { X, Loader2, Trash2, FileText } from 'lucide-react';
import type { Session, SessionInput, SessionStatus, Patient } from '../lib/types';
import { listPatients } from '../lib/patients';
import { toDateTimeLocal } from '../lib/format';
import SessionNoteModal from './SessionNoteModal';

interface Props {
  initial?: Session;
  defaultStart?: Date;       // pré-preenche data/hora ao criar a partir de um slot
  lockedPatientId?: string;  // quando criada a partir da ficha de um paciente
  onCancel: () => void;
  onSubmit: (input: SessionInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const inputCls =
  'w-full rounded-lg border border-secondary-200 px-3 py-2 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500';
const labelCls = 'block text-sm font-semibold text-secondary-600 mb-1';

const SessionForm: React.FC<Props> = ({
  initial, defaultStart, lockedPatientId, onCancel, onSubmit, onDelete,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [patientId, setPatientId] = useState(initial?.patient_id ?? lockedPatientId ?? '');
  const [inicioLocal, setInicioLocal] = useState(
    initial ? toDateTimeLocal(new Date(initial.inicio)) : defaultStart ? toDateTimeLocal(defaultStart) : ''
  );
  const [duracao, setDuracao] = useState(initial?.duracao_min ?? 50);
  const [status, setStatus] = useState<SessionStatus>(initial?.status ?? 'agendada');
  const [valor, setValor] = useState<string>(initial?.valor != null ? String(initial.valor) : '');
  const [pago, setPago] = useState<boolean>(initial?.pago ?? false);
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    listPatients()
      .then(setPatients)
      .catch(() => setError('Não foi possível carregar a lista de pacientes.'))
      .finally(() => setLoadingPatients(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return setError('Selecione o paciente.');
    if (!inicioLocal) return setError('Informe a data e hora.');
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        patient_id: patientId,
        inicio: new Date(inicioLocal).toISOString(),
        duracao_min: Number(duracao) || 50,
        status,
        valor: valor.trim() === '' ? null : Number(valor.replace(',', '.')),
        pago,
        pago_em: pago ? (initial?.pago_em ?? new Date().toISOString().slice(0, 10)) : null,
        observacoes: observacoes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <h2 className="font-serif text-lg text-secondary-600">
            {initial ? 'Editar sessão' : 'Nova sessão'}
          </h2>
          <button onClick={onCancel} aria-label="Fechar" className="text-secondary-400 hover:text-secondary-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelCls}>Paciente *</label>
            <select
              className={inputCls}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={!!lockedPatientId || loadingPatients}
            >
              <option value="">{loadingPatients ? 'Carregando...' : 'Selecione...'}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data e hora *</label>
              <input type="datetime-local" className={inputCls} value={inicioLocal} onChange={(e) => setInicioLocal(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Duração (min)</label>
              <input type="number" min={10} step={5} className={inputCls} value={duracao} onChange={(e) => setDuracao(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as SessionStatus)}>
                <option value="agendada">Agendada</option>
                <option value="realizada">Realizada</option>
                <option value="faltou">Faltou</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Valor (R$)</label>
              <input className={inputCls} value={valor} onChange={(e) => setValor(e.target.value)} placeholder="ex: 150" inputMode="decimal" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-secondary-600">
            <input
              type="checkbox"
              checked={pago}
              onChange={(e) => setPago(e.target.checked)}
              className="h-4 w-4 rounded border-secondary-300 text-secondary-500 focus:ring-secondary-500"
            />
            Pagamento recebido
          </label>

          <div>
            <label className={labelCls}>Observações</label>
            <textarea className={inputCls} rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>

          {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex gap-2">
              {initial && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              )}
              {initial && (
                <button
                  type="button"
                  onClick={() => setShowNote(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50"
                >
                  <FileText className="h-4 w-4" /> Evolução
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>

      {showNote && initial && (
        <SessionNoteModal
          sessionId={initial.id}
          patientName={patients.find((p) => p.id === patientId)?.nome ?? 'Paciente'}
          inicioISO={initial.inicio}
          onClose={() => setShowNote(false)}
        />
      )}
    </div>
  );
};

export default SessionForm;
