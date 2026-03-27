import React from 'react';
import { HeartHandshake, Brain, ShieldCheck, Scale, Smile, LucideIcon } from 'lucide-react';
import { Pillar } from '../types';

const pillarsData: Pillar[] = [
  {
    title: "Liberação de Traumas",
    subtitle: "O peso que a criança não precisa carregar",
    description: "Crianças também vivenciam lutos, medos e rupturas. A terapia oferece um espaço seguro para ressignificar essas dores, impedindo que se tornem bloqueios emocionais permanentes.",
    icon: ShieldCheck
  },
  {
    title: "Desbloqueio de Habilidades",
    subtitle: "Potencializando talentos escondidos",
    description: "Muitas vezes, a insegurança mascara a genialidade. Trabalhamos para fortalecer a autoestima e a autonomia, permitindo que seu filho explore todo o seu potencial cognitivo e social.",
    icon: Brain
  },
  {
    title: "Resolução de Transtornos",
    subtitle: "O suporte técnico em neurodivergências",
    description: "Identificação e manejo técnico de sinais de TEA, TDAH e outros transtornos. O objetivo não é rotular, mas oferecer as ferramentas adaptativas corretas para que a criança floresça.",
    icon: HeartHandshake
  },
  {
    title: "Questões Comportamentais",
    subtitle: "Equilíbrio entre amor e limites",
    description: "Disciplina não é punição, é ensino. Ajudamos pais e filhos a construírem uma rotina onde o respeito mútuo prevalece sobre as birras, a agressividade ou o isolamento.",
    icon: Scale
  },
  {
    title: "Manejo de Emoções",
    subtitle: "Alfabetização emocional",
    description: "Ensinar a criança a nomear e gerenciar o que sente (raiva, frustração, euforia) é o maior presente que se pode dar para seu futuro sucesso pessoal e profissional.",
    icon: Smile
  }
];

const Pillars: React.FC = () => {
  return (
    <section id="pillars" className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary-600 font-bold uppercase tracking-widest text-sm mb-3">
            Por que buscar terapia?
          </h2>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
            As 5 Colunas do Desenvolvimento Infantil
          </h3>
          <p className="text-slate-600 text-lg">
            A infância é a janela de oportunidade mais crítica da vida. Atuamos em cinco frentes essenciais para garantir um crescimento saudável.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillarsData.map((pillar, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl bg-warm-50 border border-warm-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                <pillar.icon size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2 font-serif">
                {pillar.title}
              </h4>
              <p className="text-sm font-semibold text-accent-400 mb-4 uppercase tracking-wide">
                {pillar.subtitle}
              </p>
              <p className="text-slate-600 leading-relaxed">
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