import React from 'react';
import { CalendarCheck, CalendarDays, Calendar } from 'lucide-react';

const plans = [
  {
    title: 'Semanal',
    frequency: '4 encontros / mês',
    price: 'R$ 800,00',
    period: '/ mês',
    icon: CalendarCheck,
    featured: true,
  },
  {
    title: 'Quinzenal',
    frequency: '2 encontros / mês',
    price: 'R$ 400,00',
    period: '/ mês',
    icon: CalendarDays,
    featured: false,
  },
  {
    title: 'Avulso',
    frequency: 'à combinar',
    price: 'R$ 250,00',
    period: '/ consulta',
    icon: Calendar,
    featured: false,
  },
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-secondary-500 font-bold uppercase tracking-widest text-sm mb-3">
            Investimento
          </h2>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-secondary-600 mb-6">
            Planos de Atendimento
          </h3>
          <p className="text-secondary-500 text-lg">
            Escolha a frequência que melhor se adapta às necessidades da sua família.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                plan.featured
                  ? 'bg-secondary-50 border-secondary-200 shadow-xl shadow-secondary-100/50 scale-105'
                  : 'bg-warm-50 border-warm-100 hover:border-secondary-200 hover:shadow-xl hover:shadow-secondary-100/50'
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary-400 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                  Mais Popular
                </span>
              )}

              <div className="mb-6 flex items-center justify-center">
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${
                    plan.featured ? 'bg-white text-secondary-500' : 'bg-white text-secondary-500'
                  }`}
                >
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
      </div>
    </section>
  );
};

export default Pricing;
