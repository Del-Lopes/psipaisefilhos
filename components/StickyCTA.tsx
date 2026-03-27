import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const StickyCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past the hero section (approx 500px)
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <a
      href="https://wa.me/5511987814483"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 animate-fade-in-up"
    >
      <MessageCircle size={24} />
      <span className="font-bold hidden md:inline">Agendar Consulta</span>
      <span className="font-bold md:hidden">Agendar</span>
    </a>
  );
};

export default StickyCTA;