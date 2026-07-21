import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import Markdown from '../components/Markdown';
import { getReport, getEmitter } from '../lib/reports';

interface PrintData {
  titulo: string;
  pacienteNome: string;
  corpo: string;
  emitente: {
    nome: string | null;
    crp: string | null;
    documento: string | null;
    telefone: string | null;
    endereco: string | null;
  };
  dataEmissao: string;
}

const STORAGE_KEY = 'gestao:report-print';

/** Salva os dados e navega para a impressão (usado pelo modal de geração). */
export function stashPrintData(data: PrintData) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const ReportPrint: React.FC = () => {
  const [params] = useSearchParams();
  const reportId = params.get('id'); // se vier ?id=, carrega do banco (relatório salvo)
  const [data, setData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (reportId) {
        // Reabrir relatório salvo do banco.
        try {
          const [rep, em] = await Promise.all([getReport(reportId), getEmitter()]);
          if (rep) {
            setData({
              titulo: rep.titulo,
              pacienteNome: rep.patient?.nome ?? '',
              corpo: rep.conteudo,
              emitente: {
                nome: em?.nome ?? null, crp: em?.crp ?? null, documento: em?.documento ?? null,
                telefone: em?.telefone ?? null, endereco: em?.endereco ?? null,
              },
              dataEmissao: rep.created_at,
            });
          }
        } catch { /* cai no estado vazio */ }
      } else {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) setData(JSON.parse(raw));
      }
      setLoading(false);
    })();
  }, [reportId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-secondary-300" /></div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-secondary-500">
        <p>Nenhum relatório para exibir.</p>
        <Link to="/app/pacientes" className="text-secondary-600 underline mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  const dataFmt = new Date(data.dataEmissao).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="report-print-root min-h-screen bg-warm-50">
      {/* Barra de ações — escondida na impressão */}
      <div className="no-print sticky top-0 z-10 flex items-center justify-between gap-4 bg-white/90 backdrop-blur border-b border-secondary-100 px-4 py-3">
        <button onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-sm text-secondary-500 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-secondary-600 shadow-sm">
          <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
        </button>
      </div>

      {/* Folha A4 */}
      <div className="report-sheet mx-auto my-8 bg-white rounded-lg shadow-[0_10px_40px_-12px_rgba(75,89,69,0.25)]">
        {/* faixa superior com cor da marca */}
        <div className="report-accent" />

        <header className="flex items-start justify-between gap-6 pb-5 mb-8 border-b border-secondary-100">
          <img src="/logo.png" alt="" className="h-20 w-20 object-contain" />
          <div className="text-right text-xs text-secondary-500 leading-relaxed">
            <p className="font-serif text-base text-secondary-700">{data.emitente.nome ?? 'Psicóloga'}</p>
            {data.emitente.crp && <p>CRP: {data.emitente.crp}</p>}
            {data.emitente.documento && <p>{data.emitente.documento}</p>}
            {data.emitente.telefone && <p>{data.emitente.telefone}</p>}
            {data.emitente.endereco && <p>{data.emitente.endereco}</p>}
          </div>
        </header>

        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl text-secondary-700">{data.titulo}</h1>
          <div className="mx-auto mt-2 h-0.5 w-16 rounded-full bg-primary-400" />
          <p className="mt-3 text-sm text-secondary-400">
            Paciente: <span className="font-semibold text-secondary-600">{data.pacienteNome}</span>
          </p>
        </div>

        <article className="report-article">
          <Markdown text={data.corpo} />
        </article>

        <footer className="mt-14 pt-2 text-center text-sm text-secondary-600">
          <p className="text-secondary-400">{dataFmt}</p>
          <div className="mt-12 inline-block border-t border-secondary-400 px-12 pt-1.5">
            <p className="font-serif text-secondary-700">{data.emitente.nome ?? ''}</p>
            {data.emitente.crp && <p className="text-xs text-secondary-500">Psicóloga · CRP {data.emitente.crp}</p>}
          </div>
        </footer>
      </div>

      <style>{`
        .report-sheet {
          width: 210mm;
          min-height: 297mm;
          padding: 0 20mm 20mm;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }
        .report-accent {
          height: 8px;
          margin: 0 -20mm 16mm;
          background: linear-gradient(90deg, #F28E6F 0%, #FFD55D 50%, #AEC370 100%);
        }
        .report-article { font-size: 11pt; }
        @media print {
          .no-print { display: none !important; }
          .report-print-root { background: white !important; }
          .report-sheet {
            margin: 0 !important; box-shadow: none !important; border-radius: 0 !important;
            width: auto; min-height: auto; padding: 0;
          }
          .report-accent { margin: 0 0 10mm; }
          @page { size: A4; margin: 16mm; }
        }
      `}</style>
    </div>
  );
};

export default ReportPrint;
