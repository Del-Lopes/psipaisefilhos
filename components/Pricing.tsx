import React from 'react';
import { CalendarCheck, CalendarDays, Calendar, Shield } from 'lucide-react';

const plans = [
  {
    title: 'Semanal',
    frequency: '4 encontros por mês',
    price: 'R$ 800,00',
    period: '/ mês',
    icon: CalendarCheck,
  },
  {
    title: 'Quinzenal',
    frequency: '2 encontros por mês',
    price: 'R$ 400,00',
    period: '/ mês',
    icon: CalendarDays,
  },
  {
    title: 'Avulso',
    frequency: 'Sessão individual / avaliação',
    price: 'R$ 250,00',
    period: '/ consulta',
    icon: Calendar,
  },
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-secondary-500 font-bold uppercase tracking-widest text-sm mb-3">
            Informações Financeiras
          </h2>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-secondary-600 mb-6">
            Modalidades de Atendimento
          </h3>
          <p className="text-secondary-500 text-lg">
            Frequências sugeridas para o acompanhamento terapêutico, definidas conforme a necessidade de cada caso.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-2xl border bg-warm-50 border-warm-100 p-8 hover:border-secondary-200 hover:shadow-xl hover:shadow-secondary-100/50 transition-all duration-300"
            >
              <div className="mb-6 flex items-center justify-center">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm bg-white text-secondary-500">
                  <plan.icon size={28} />
                </div>
              </div>

              <h4 className="text-xl font-bold text-secondary-600 text-center font-serif mb-2">
                {plan.title}
              </h4>
              <p className="text-sm text-secondary-400 text-center mb-6">
                {plan.frequency}
              </p>

              <div className="mt-auto text-center">
                <span className="text-3xl font-bold text-secondary-600">{plan.price}</span>
                <span className="text-secondary-400 text-sm ml-1">{plan.period}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center max-w-2xl mx-auto space-y-2 text-xs text-secondary-400">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <Shield size={14} className="text-secondary-500" />
            Em conformidade com o Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005).
          </p>
          <p>
            A definição do plano e periodicidade adequada é realizada após a primeira entrevista de acolhimento e avaliação.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
