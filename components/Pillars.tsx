import React from 'react';
import { HeartHandshake, Brain, ShieldCheck, Scale, Smile, LucideIcon } from 'lucide-react';
import { Pillar } from '../types';

const pillarsData: Pillar[] = [
  {
    title: "Acolhimento de Traumas",
    subtitle: "Espaço seguro de escuta e acolhimento",
    description: "Crianças também vivenciam lutos, medos e rupturas. A terapia oferece um espaço acolhedor para ressignificar essas vivências e desenvolver recursos emocionais.",
    icon: ShieldCheck
  },
  {
    title: "Desenvolvimento de Habilidades",
    subtitle: "Fortalecendo o potencial e a autonomia",
    description: "Trabalhamos para fortalecer a autoestima e a autoconfiança, auxiliando a criança a explorar e desenvolver seu potencial cognitivo, afetivo e social.",
    icon: Brain
  },
  {
    title: "Suporte em Neurodivergências",
    subtitle: "Acompanhamento técnico e individualizado",
    description: "Acompanhamento e suporte terapêutico em demandas como TEA, TDAH e outras neurodivergências. O objetivo é oferecer estratégias adaptativas que favoreçam o bem-estar e o desenvolvimento.",
    icon: HeartHandshake
  },
  {
    title: "Questões Comportamentais",
    subtitle: "Equilíbrio entre afeto e limites",
    description: "Orientação e suporte para construir uma rotina baseada no respeito mútuo, comunicação clara e cooperação no ambiente familiar.",
    icon: Scale
  },
  {
    title: "Manejo de Emoções",
    subtitle: "Desenvolvimento socioemocional",
    description: "Auxiliar a criança a reconhecer, nomear e expressar suas emoções (como raiva, frustração e medo) de maneira saudável e construtiva.",
    icon: Smile
  }
];

const Pillars: React.FC = () => {
  return (
    <section id="pillars" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-secondary-500 font-bold uppercase tracking-widest text-sm mb-3">
            Por que buscar terapia?
          </h2>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-secondary-500 mb-6">
            Eixos do Acompanhamento Psicológico
          </h3>
          <p className="text-secondary-500 text-lg">
            A infância é uma etapa rica em descobertas e aprendizados. Atuamos em frentes essenciais para promover a saúde emocional e a qualidade de vida.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillarsData.map((pillar, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl bg-warm-50 border border-warm-100 hover:border-secondary-200 hover:shadow-xl hover:shadow-secondary-100/50 transition-all duration-300"
            >
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-secondary-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <pillar.icon size={32} />
              </div>
              <h4 className="text-xl font-bold text-secondary-500 mb-2 font-serif">
                {pillar.title}
              </h4>
              <p className="text-sm font-bold text-primary-500 mb-4 uppercase tracking-wide">
                {pillar.subtitle}
              </p>
              <p className="text-secondary-500 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pillars;