import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, Sparkles, Printer, AlertTriangle, Save, Eye, Pencil, Check } from 'lucide-react';
import type { ReportType, ReportTemplate, ReportPayload } from '../lib/types';
import {
  listTemplates, getEmitter, generateReportText,
  buildSessionPayload, buildGeneralPayload, saveReport,
} from '../lib/reports';
import { stashPrintData } from '../pages/ReportPrint';
import Markdown from './Markdown';

interface Props {
  tipo: ReportType;
  patientId: string;
  patientName: string;
  sessionId?: string; // obrigatório quando tipo = 'sessao'
  textoInicial?: string; // pré-preenche o texto (ao voltar da impressão para editar)
  onClose: () => void;
  onSaved?: () => void; // avisa a ficha para recarregar a lista de relatórios
}

const ReportModal: React.FC<Props> = ({ tipo, patientId, patientName, sessionId, textoInicial, onClose, onSaved }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [payload, setPayload] = useState<ReportPayload | null>(null);
  const [texto, setTexto] = useState(textoInicial ?? '');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [view, setView] = useState<'editar' | 'preview'>('editar');
  const [error, setError] = useState<string | null>(null);

  const titulo = tipo === 'sessao' ? 'Relatório de Sessão' : 'Relatório de Acompanhamento';

  useEffect(() => {
    (async () => {
      try {
        const [tpls, pl] = await Promise.all([
          listTemplates(tipo),
          tipo === 'sessao' && sessionId
            ? buildSessionPayload(patientId, sessionId)
            : buildGeneralPayload(patientId),
        ]);
        setTemplates(tpls);
        setTemplateId(tpls[0]?.id ?? '');
        setPayload(pl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do relatório.');
      } finally {
        setLoading(false);
      }
    })();
  }, [tipo, patientId, sessionId]);

  const handleGenerateAI = async () => {
    if (!payload) return;
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return setError('Selecione um modelo de relatório em Configurações.');
    setError(null);
    setGenerating(true);
    try {
      const gerado = await generateReportText(payload, tpl.instrucoes);
      setTexto(gerado);
      setSaved(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar com IA.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!texto.trim()) return setError('Nada para salvar. Gere ou escreva o texto primeiro.');
    setError(null);
    setSaving(true);
    try {
      await saveReport({
        patient_id: patientId,
        session_id: tipo === 'sessao' ? sessionId ?? null : null,
        tipo,
        titulo,
        conteudo: texto,
      });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    if (!texto.trim()) return setError('O relatório está vazio. Gere com IA ou escreva o texto.');
    const emitter = await getEmitter();
    stashPrintData({
      titulo,
      pacienteNome: patientName,
      corpo: texto,
      emitente: {
        nome: emitter?.nome ?? null,
        crp: emitter?.crp ?? null,
        documento: emitter?.documento ?? null,
        telefone: emitter?.telefone ?? null,
        endereco: emitter?.endereco ?? null,
      },
      dataEmissao: new Date().toISOString(),
      edicao: { patientId, tipo, sessionId, texto },
    });
    navigate('/app/relatorio/print');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <h2 className="font-serif text-lg text-secondary-600">
            {tipo === 'sessao' ? 'Relatório de sessão' : 'Relatório geral'} · {patientName}
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="text-secondary-400 hover:text-secondary-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-semibold text-secondary-600 mb-1">Modelo (IA)</label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full rounded-lg border border-secondary-200 px-3 py-2 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500"
                  >
                    {templates.length === 0 ? (
                      <option value="">Nenhum modelo cadastrado</option>
                    ) : (
                      templates.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)
                    )}
                  </select>
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={generating || templates.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-nature-600 px-4 py-2 text-sm font-semibold text-white hover:bg-nature-700 disabled:opacity-50"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Gerar com IA
                </button>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-accent-50 text-accent-800 px-3 py-2 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  O texto gerado por IA é um <strong>rascunho</strong>. Revise e edite cuidadosamente
                  antes de exportar — a responsabilidade clínica pelo conteúdo é da profissional.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-secondary-600">Texto do relatório</label>
                  <div className="flex rounded-lg border border-secondary-200 overflow-hidden text-xs">
                    <button
                      onClick={() => setView('editar')}
                      className={`flex items-center gap-1 px-3 py-1.5 font-semibold ${view === 'editar' ? 'bg-secondary-500 text-white' : 'text-secondary-500 hover:bg-secondary-50'}`}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => setView('preview')}
                      className={`flex items-center gap-1 px-3 py-1.5 font-semibold ${view === 'preview' ? 'bg-secondary-500 text-white' : 'text-secondary-500 hover:bg-secondary-50'}`}
                    >
                      <Eye className="h-3.5 w-3.5" /> Prévia
                    </button>
                  </div>
                </div>
                {view === 'editar' ? (
                  <textarea
                    value={texto}
                    onChange={(e) => { setTexto(e.target.value); setSaved(false); }}
                    placeholder="Gere com IA acima, ou escreva/cole o texto do relatório aqui."
                    className="w-full rounded-lg border border-secondary-200 px-3 py-3 text-secondary-700 leading-relaxed focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500 min-h-[300px] font-mono text-sm"
                  />
                ) : (
                  <div className="rounded-lg border border-secondary-200 px-4 py-3 min-h-[300px] max-h-[400px] overflow-y-auto bg-warm-50">
                    {texto.trim()
                      ? <Markdown text={texto} />
                      : <p className="text-sm text-secondary-400">Nada para pré-visualizar ainda.</p>}
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-secondary-100 px-6 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50">
            Fechar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center gap-2 rounded-lg border border-secondary-300 px-4 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4 text-nature-600" /> : <Save className="h-4 w-4" />}
            {saved ? 'Salvo' : 'Salvar'}
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-60"
          >
            <Printer className="h-4 w-4" /> Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
