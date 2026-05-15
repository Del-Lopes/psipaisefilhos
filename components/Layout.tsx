import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import StickyCTA from './StickyCTA';

const Layout: React.FC = () => {
  return (
    <div className="antialiased text-secondary-600 bg-warm-50 selection:bg-secondary-200 selection:text-secondary-900">
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
      <StickyCTA />
    </div>
  );
};

export default Layout;
