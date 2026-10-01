import React from 'react';
import { GraduationCap, Award } from 'lucide-react';

const Bio: React.FC = () => {
  return (
    <section id="bio" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl mx-auto bg-warm-50 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row">
          
          {/* Photo Section */}
          <div className="md:w-2/5 relative min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"
              alt="Psicóloga Bárbara Carvalho" 
              className="absolute inset-0 w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/500x700/F28E6F/FFFFFF?text=B%C3%A1rbara+Carvalho+Psic%C3%B3loga';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden"></div>
            <div className="absolute bottom-6 left-6 text-white md:hidden">
              <p className="font-bold text-xl uppercase tracking-wider">Bárbara Carvalho</p>
              <p className="text-sm opacity-90">Psicóloga | CRP 06/XXXXXX</p>
            </div>
          </div>

          {/* Text Section */}
          <div className="md:w-3/5 p-10 md:p-14 flex flex-col justify-center">
            <h2 className="text-3xl font-serif font-bold text-secondary-600 mb-1">
              Bárbara Carvalho
            </h2>
            <h3 className="text-primary-700 font-bold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
              <span>Psicóloga</span>
              <span>•</span>
              <span>CRP 06/XXXXXX</span>
            </h3>

            <div className="space-y-5 text-secondary-500 leading-relaxed text-base">
              <p>
                Com formação em <strong>Psicologia pela Universidade Presbiteriana Mackenzie</strong>, minha prática clínica é dedicada ao acolhimento ético, técnico e afetuoso de crianças e suas famílias.
              </p>
              <p>
                A atuação é aprimorada pelo estudo e aprofundamento contínuos em <strong>Psicologia Infantil e Neurodivergências</strong>, permitindo oferecer estratégias terapêuticas singularizadas para os desafios do desenvolvimento.
              </p>
              <p>
                O compromisso do trabalho no consultório é caminhar ao lado da família na construção de um ambiente seguro e estruturante, promovendo a autonomia, a saúde emocional e a qualidade de vida da criança.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-secondary-100 flex flex-wrap items-center gap-6 text-xs text-secondary-500">
              <div className="flex items-center gap-2 font-medium bg-white px-3 py-2 rounded-xl border border-secondary-100">
                <GraduationCap size={18} className="text-primary-500" />
                <span>Graduação: Univ. Presbiteriana Mackenzie</span>
              </div>
              <div className="flex items-center gap-2 font-medium bg-white px-3 py-2 rounded-xl border border-secondary-100">
                <Award size={18} className="text-accent-600" />
                <span>Foco em Neurodivergências</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bio;