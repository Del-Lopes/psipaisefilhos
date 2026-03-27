import React from 'react';

const Bio: React.FC = () => {
  return (
    <section id="bio" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl mx-auto bg-warm-50 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row">
          
          {/* Photo Section */}
          <div className="md:w-2/5 relative min-h-[400px]">
            <img 
              src="https://picsum.photos/500/700" // Placeholder for Portrait
              alt="Psi Pais e Filhos" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent md:hidden"></div>
            <div className="absolute bottom-6 left-6 text-white md:hidden">
              <p className="font-bold text-xl uppercase tracking-wider">Psi Pais e Filhos</p>
              <p className="text-sm opacity-90">Psicóloga Infantil</p>
            </div>
          </div>

          {/* Text Section */}
          <div className="md:w-3/5 p-10 md:p-14 flex flex-col justify-center">
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-2">
              Psi Pais e Filhos
            </h2>
            <h3 className="text-primary-600 font-semibold mb-6 uppercase tracking-wider text-sm">
              Psicologia Infantil e Parental
            </h3>

            <div className="space-y-6 text-slate-600 leading-relaxed">
              <p>
                Com uma formação sólida em <strong>Psicologia pela Universidade Presbiteriana Mackenzie</strong>, uma das instituições mais tradicionais e respeitadas do país, a atuação da nossa equipe é dedicada a desvendar os mistérios da mente infantil.
              </p>
              <p>
                A atuação é aprofundada pela <strong>Pós-graduação em Psicologia Infantil e Neurodivergências</strong>, o que permite ir além do acolhimento básico, oferecendo intervenções técnicas e precisas para os desafios modernos do desenvolvimento.
              </p>
              <p>
                Nossa missão não é apenas tratar sintomas, mas ser parceiro das famílias na construção de uma infância que sirva de trampolim para uma vida adulta feliz e funcional. Acreditamos na ciência aliada ao afeto como motor de transformação.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <img 
                src="https://picsum.photos/200/80" // Placeholder for signature or Mackenzie logo
                alt="Mackenzie Logo" 
                className="h-12 opacity-60 grayscale hover:grayscale-0 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bio;