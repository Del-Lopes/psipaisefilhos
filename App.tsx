import React from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Pillars from './components/Pillars';
import FutureImpact from './components/FutureImpact';
import Specialty from './components/Specialty';
import Bio from './components/Bio';
import Footer from './components/Footer';
import StickyCTA from './components/StickyCTA';

const App: React.FC = () => {
  return (
    <div className="antialiased text-slate-800 bg-warm-50 selection:bg-primary-200 selection:text-primary-900">
      <Navigation />
      
      <main>
        <Hero />
        <Pillars />
        <FutureImpact />
        <Specialty />
        <Bio />
      </main>

      <Footer />
      <StickyCTA />
    </div>
  );
};

export default App;