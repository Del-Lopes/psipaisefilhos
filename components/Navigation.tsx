import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';

const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Início', href: '/#hero' },
    { label: 'Desenvolvimento', href: '/#pillars' },
    { label: 'Atuação', href: '/#specialty' },
    { label: 'Sobre', href: '/#bio' },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (location.pathname !== '/') {
      return;
    }
    e.preventDefault();
    const id = href.replace('/#', '');
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="font-serif font-bold text-xl md:text-2xl text-secondary-500 flex items-center gap-2 group">
          <div className="bg-nature-100 p-1.5 rounded-xl transition-transform group-hover:rotate-12">
            <Heart size={20} className="text-primary-500 fill-primary-500/20" />
          </div>
          <span className="tracking-tight">Bárbara Carvalho</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-secondary-600 hover:text-secondary-400 font-medium transition-colors text-sm uppercase tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a 
            href="https://wa.me/5511987814483"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-full font-bold transition-all text-sm shadow-lg hover:shadow-primary-500/20"
          >
            Agendar Consulta
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-secondary-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl py-6 px-6 flex flex-col space-y-4 border-t border-slate-100">
          {navLinks.map((link) => (
            <a 
              key={link.label}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="text-secondary-600 font-medium text-lg"
            >
              {link.label}
            </a>
          ))}
          <a 
            href="https://wa.me/5511987814483"
            className="bg-primary-500 text-white text-center py-3 rounded-xl font-bold shadow-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Agendar pelo WhatsApp
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navigation;