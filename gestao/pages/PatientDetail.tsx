import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, Plus, Phone, Mail, Loader2, UserRound, Star, CalendarDays,
  FolderOpen, ExternalLink, FileText, FileCheck,
} from 'lucide-react';
import {
  getPatient, updatePatient, deletePatient,
  listGuardians, createGuardian, updateGuardian, deleteGuardian,
} from '../lib/patients';
import { listSessionsByPatient } from '../lib/sessions';
import { sessionsWithNotes } from '../lib/notes';
import type { Patient, PatientInput, Guardian, GuardianInput, Session } from '../lib/types';
import {
  calcAge, formatDateBR, statusLabels, statusStyles,
  formatTime, formatBRL, sessionStatusLabels, sessionStatusStyles,
} from '../lib/format';
import PatientForm from '../components/PatientForm';
import GuardianForm from '../components/GuardianForm';
import SessionNoteModal from '../components/SessionNoteModal';
import EvolutionSection from '../components/EvolutionSection';

const Field: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">{label}</p>
    <p className="text-secondary-700 mt-0.5">{value || '—'}</p>
  </div>
);

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notedIds, setNotedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingPatient, setEditingPatient] = useState(false);
  const [guardianModal, setGuardianModal] = useState<{ open: boolean; edit?: Guardian }>({ open: false });
  const [noteSession, setNoteSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<'ficha' | 'evolucao'>('ficha');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [p, g, s] = await Promise.all([
        getPatient(id), listGuardians(id), listSessionsByPatient(id),
      ]);
      setPatient(p);
      setGuardians(g);
      setSessions(s);
      setNotedIds(await sessionsWithNotes(s.map((x) => x.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleUpdatePatient = async (input: PatientInput) => {
    if (!id) return;
    await updatePatient(id, input);
    setEditingPatient(false);
    load();
  };

  const handleDeletePatient = async () => {
    if (!id) return;
    if (!confirm('Excluir este paciente? Todos os responsáveis vinculados também serão removidos. Esta ação não pode ser desfeita.')) return;
    await deletePatient(id);
    navigate('/app/pacientes', { replace: true });
  };

  const handleGuardianSubmit = async (input: GuardianInput) => {
    if (!id) return;
    if (guardianModal.edit) {
      await updateGuardian(guardianModal.edit.id, input);
    } else {
      await createGuardian(id, input);
    }
    setGuardianModal({ open: false });
    load();
  };

  const handleDeleteGuardian = async (g: Guardian) => {
    if (!confirm(`Remover o responsável "${g.nome}"?`)) return;
    await deleteGuardian(g.id);
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>;
  }

  if (error || !patient) {
    return (
      <div className="space-y-4">
        <Link to="/app/pacientes" className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <p className="text-sm text-primary-700 bg-primary-50 rounded-lg px-3 py-2">{error ?? 'Paciente não encontrado.'}</p>
      </div>
    );
  }

  const age = calcAge(patient.data_nascimento);

  return (
    <div className="space-y-6">
      <Link to="/app/pacientes" className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Pacientes
      </Link>

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl text-secondary-600">{patient.nome}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[patient.status]}`}>
                {statusLabels[patient.status]}
              </span>
            </div>
            <p className="text-sm text-secondary-400 mt-1">
              {age !== null ? `${age} anos` : 'Idade não informada'} · Nascimento: {formatDateBR(patient.data_nascimento)}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setEditingPatient(true)} className="flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-2 text-sm font-semibold text-secondary-600 hover:bg-secondary-50">
              <Pencil className="h-4 w-4" /> Editar
            </button>
            <button onClick={handleDeletePatient} className="flex items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <Field label="Sexo" value={patient.sexo === 'F' ? 'Feminino' : patient.sexo === 'M' ? 'Masculino' : patient.sexo} />
          <Field label="Escola" value={patient.escola} />
          <Field label="Ano escolar" value={patient.ano_escolar} />
        </div>
        {patient.queixa_inicial && <div className="mt-4"><Field label="Queixa inicial" value={patient.queixa_inicial} /></div>}
        {patient.observacoes && <div className="mt-4"><Field label="Observações" value={patient.observacoes} /></div>}
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-secondary-100">
        {([['ficha', 'Ficha'], ['evolucao', 'Evolução']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-secondary-500 text-secondary-600'
                : 'border-transparent text-secondary-400 hover:text-secondary-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'evolucao' && <EvolutionSection patientId={patient.id} />}

      {tab === 'ficha' && (
      <>
      {/* Responsáveis */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-secondary-600">Responsáveis</h2>
          <button onClick={() => setGuardianModal({ open: true })} className="flex items-center gap-1.5 rounded-lg bg-secondary-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-secondary-600">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>

        {guardians.length === 0 ? (
          <p className="text-sm text-secondary-400 py-4 text-center">Nenhum responsável cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {guardians.map((g) => (
              <div key={g.id} className="flex items-start justify-between gap-4 rounded-lg border border-secondary-100 p-4">
                <div className="flex gap-3">
                  <div className="h-9 w-9 rounded-full bg-secondary-100 flex items-center justify-center shrink-0">
                    <UserRound className="h-5 w-5 text-secondary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-700 flex items-center gap-2">
                      {g.nome}
                      {g.is_pagante && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 bg-accent-100 px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3" /> Pagante
                        </span>
                      )}
                    </p>
                    {g.parentesco && <p className="text-sm text-secondary-400">{g.parentesco}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-secondary-500">
                      {g.telefone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {g.telefone}</span>}
                      {g.email && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {g.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setGuardianModal({ open: true, edit: g })} className="p-2 text-secondary-400 hover:text-secondary-600" aria-label="Editar responsável">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteGuardian(g)} className="p-2 text-secondary-400 hover:text-primary-600" aria-label="Remover responsável">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentos (pasta externa) */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-serif text-lg text-secondary-600">Documentos</h2>
          {patient.drive_url && (
            <a
              href={patient.drive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-secondary-500 px-3 py-2 text-sm font-semibold text-white hover:bg-secondary-600"
            >
              <FolderOpen className="h-4 w-4" /> Abrir pasta no Drive
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          )}
        </div>
        {patient.drive_url ? (
          <p className="text-sm text-secondary-400">
            Laudos, relatórios e demais documentos ficam na pasta vinculada do Google Drive.
          </p>
        ) : (
          <p className="text-sm text-secondary-400">
            Nenhuma pasta vinculada. Use <strong>Editar</strong> para colar o link da pasta do Drive deste paciente.
          </p>
        )}
      </div>

      {/* Histórico de sessões */}
      <div className="bg-white rounded-2xl border border-secondary-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-secondary-600">Sessões</h2>
          <Link to="/app/agenda" className="text-sm text-secondary-500 hover:underline">Ver agenda</Link>
        </div>
        {sessions.length === 0 ? (
          <p className="text-sm text-secondary-400 py-4 text-center">Nenhuma sessão registrada.</p>
        ) : (
          <div className="divide-y divide-secondary-50">
            {sessions.map((s) => {
              const hasNote = notedIds.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setNoteSession(s)}
                  className="w-full flex items-center justify-between gap-4 py-3 text-left hover:bg-secondary-50/60 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-secondary-300 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-secondary-700">
                        {formatDateBR(s.inicio.slice(0, 10))} · {formatTime(s.inicio)}
                      </p>
                      <p className="text-xs text-secondary-400">
                        {s.duracao_min} min · {formatBRL(s.valor)}
                        {s.valor != null && (
                          <span className={`ml-1 font-semibold ${s.pago ? 'text-nature-600' : 'text-primary-600'}`}>
                            · {s.pago ? 'pago' : 'pendente'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${hasNote ? 'text-nature-600' : 'text-secondary-300'}`}
                      title={hasNote ? 'Evolução registrada' : 'Sem evolução'}
                    >
                      {hasNote ? <FileCheck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      <span className="hidden sm:inline">{hasNote ? 'Evolução' : 'Registrar'}</span>
                    </span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${sessionStatusStyles[s.status]}`}>
                      {sessionStatusLabels[s.status]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      </>
      )}

      {editingPatient && (
        <PatientForm initial={patient} onCancel={() => setEditingPatient(false)} onSubmit={handleUpdatePatient} />
      )}
      {noteSession && patient && (
        <SessionNoteModal
          sessionId={noteSession.id}
          patientName={patient.nome}
          inicioISO={noteSession.inicio}
          patientId={patient.id}
          onClose={() => setNoteSession(null)}
          onSaved={load}
        />
      )}
      {guardianModal.open && (
        <GuardianForm initial={guardianModal.edit} onCancel={() => setGuardianModal({ open: false })} onSubmit={handleGuardianSubmit} />
      )}
    </div>
  );
};

export default PatientDetail;
