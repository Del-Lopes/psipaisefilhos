import React, { useEffect, useState } from 'react';
import { Loader2, Save, Plus, Pencil, Trash2, FileText, X } from 'lucide-react';
import {
  getEmitter, saveEmitter, listTemplates, createTemplate, updateTemplate, deleteTemplate,
} from '../lib/reports';
import type { EmitterInput, ReportTemplate, ReportType, ReportTemplateInput } from '../lib/types';

const inputCls =
  'w-full rounded-lg border border-secondary-200 px-3 py-2 text-secondary-700 focus:border-secondary-500 focus:outline-none focus:ring-1 focus:ring-secondary-500';
const labelCls = 'block text-sm font-semibold text-secondary-600 mb-1';

const tipoLabels: Record<ReportType, string> = { sessao: 'Sessão', geral: 'Geral' };

const Configuracoes: React.FC = () => {
  const [emitter, setEmitter] = useState<EmitterInput>({ nome: '', crp: '', documento: '', telefone: '', endereco: '' });
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingEmitter, setSavingEmitter] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tplModal, setTplModal] = useState<{ open: boolean; edit?: ReportTemplate }>({ open: false });

  const load = async () => {
    setLoading(true);
    try {
      const [em, tpls] = await Promise.all([getEmitter(), listTemplates()]);
      if (em) setEmitter({
        nome: em.nome ?? '', crp: em.crp ?? '', documento: em.documento ?? '',
        telefone: em.telefone ?? '', endereco: em.endereco ?? '',
      });
      setTemplates(tpls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaveEmitter = async () => {
    setSavingEmitter(true);
    setMsg(null);
    setError(null);
    try {
      await saveEmitter(emitter);
      setMsg('Dados salvos.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setSavingEmitter(false);
    }
  };

  const set = <K extends keyof EmitterInput>(k: K, v: EmitterInput[K]) => setEmitter((e) => ({ ...e, [k]: v }));

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="font-serif text-2xl text-secondary-600">Configurações</h1>

      {/* Dados da emitente */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <h2 className="font-serif text-lg text-secondary-600 mb-4">Meus dados (para relatórios)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Nome completo</label>
            <input className={inputCls} value={emitter.nome ?? ''} onChange={(e) => set('nome', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>CRP</label>
            <input className={inputCls} value={emitter.crp ?? ''} onChange={(e) => set('crp', e.target.value)} placeholder="Ex: 06/123456" />
          </div>
          <div>
            <label className={labelCls}>CPF / CNPJ</label>
            <input className={inputCls} value={emitter.documento ?? ''} onChange={(e) => set('documento', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Telefone</label>
            <input className={inputCls} value={emitter.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Endereço</label>
            <input className={inputCls} value={emitter.endereco ?? ''} onChange={(e) => set('endereco', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={handleSaveEmitter} disabled={savingEmitter} className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-60">
            {savingEmitter ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </button>
          {msg && <span className="text-sm text-nature-700">{msg}</span>}
        </div>
      </div>

      {/* Modelos de relatório (IA) */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-secondary-600">Modelos de relatório (IA)</h2>
          <button onClick={() => setTplModal({ open: true })} className="flex items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-secondary-600">
            <Plus className="h-4 w-4" /> Novo modelo
          </button>
        </div>
        <p className="text-sm text-secondary-400 mb-4">
          Cada modelo contém as instruções que a IA seguirá para escrever o relatório (formato, tom, estrutura, seções).
        </p>
        {templates.length === 0 ? (
          <p className="text-sm text-secondary-400 py-4 text-center">Nenhum modelo cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-secondary-100 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-secondary-300 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-secondary-700 truncate">{t.nome}</p>
                    <p className="text-xs text-secondary-400">Tipo: {tipoLabels[t.tipo]}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setTplModal({ open: true, edit: t })} className="p-2 text-secondary-300 hover:text-secondary-600" aria-label="Editar modelo"><Pencil className="h-4 w-4" /></button>
                  <button
                    onClick={async () => { if (confirm(`Excluir o modelo "${t.nome}"?`)) { await deleteTemplate(t.id); load(); } }}
                    className="p-2 text-secondary-300 hover:text-primary-600" aria-label="Excluir modelo"
                  ><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}

      {tplModal.open && (
        <TemplateForm
          initial={tplModal.edit}
          onCancel={() => setTplModal({ open: false })}
          onSubmit={async (input) => {
            if (tplModal.edit) await updateTemplate(tplModal.edit.id, input);
            else await createTemplate(input);
            setTplModal({ open: false });
            load();
          }}
        />
      )}
    </div>
  );
};

// --- Formulário de modelo (inline) -----------------------------------------

const TemplateForm: React.FC<{
  initial?: ReportTemplate;
  onCancel: () => void;
  onSubmit: (input: ReportTemplateInput) => Promise<void>;
}> = ({ initial, onCancel, onSubmit }) => {
  const [nome, setNome] = useState(initial?.nome ?? '');
  const [tipo, setTipo] = useState<ReportType>(initial?.tipo ?? 'geral');
  const [instrucoes, setInstrucoes] = useState(initial?.instrucoes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !instrucoes.trim()) return setError('Preencha nome e instruções.');
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ nome: nome.trim(), tipo, instrucoes: instrucoes.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-secondary-100 px-6 py-4">
          <h2 className="font-serif text-lg text-secondary-600">{initial ? 'Editar modelo' : 'Novo modelo'}</h2>
          <button onClick={onCancel} aria-label="Fechar" className="text-secondary-400 hover:text-secondary-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nome do modelo</label>
              <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value as ReportType)}>
                <option value="geral">Geral (paciente)</option>
                <option value="sessao">Sessão</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Instruções para a IA</label>
            <textarea
              className={inputCls}
              rows={8}
              value={instrucoes}
              onChange={(e) => setInstrucoes(e.target.value)}
              placeholder="Ex: Escreva um relatório psicológico formal em terceira pessoa, com as seções: Identificação, Motivo do acompanhamento, Evolução observada, Considerações. Use linguagem técnica mas acessível aos responsáveis. Não invente dados que não estejam no material fornecido."
            />
          </div>
          {error && <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 disabled:opacity-60">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Configuracoes;
