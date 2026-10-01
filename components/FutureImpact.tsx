import React from 'react';

const FutureImpact: React.FC = () => {
  return (
    <section className="py-24 bg-secondary-800 text-white relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-700/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-700/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-10 leading-tight">
            A Ponte para o Futuro: <br/>
            <span className="text-secondary-300">O Impacto na Vida Adulta</span>
          </h2>
          
          <div className="space-y-8 text-lg md:text-xl text-secondary-200 leading-relaxed font-light">
            <p>
              A infância é uma etapa fundamental na formação emocional e social do indivíduo. O acolhimento e o apoio oferecidos nesta fase favorecem o desenvolvimento de crianças mais autônomas, capacitadas para lidar com desafios e construir relacionamentos saudáveis ao longo da vida.
            </p>
            <p>
              Observar com atenção os sinais do desenvolvimento e buscar acompanhamento profissional no momento adequado permite acolher necessidades específicas de forma preventiva. A intervenção no tempo certo fortalece os recursos emocionais da criança, promovendo sua autonomia e bem-estar.
            </p>
          </div>

          <div className="mt-12 w-24 h-1 bg-accent-500 mx-auto rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default FutureImpact;