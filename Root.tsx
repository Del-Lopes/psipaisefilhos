import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Investimento from './pages/Investimento';
import { appRoutes } from './gestao/AppRoutes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Site público */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/investimento" element={<Investimento />} />
        </Route>
        {/* Sistema de gestão (área logada) */}
        {appRoutes}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
