import React from 'react';
import Hero from '../components/Hero';
import Pillars from '../components/Pillars';
import FutureImpact from '../components/FutureImpact';
import Specialty from '../components/Specialty';
import Bio from '../components/Bio';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Pillars />
      <FutureImpact />
      <Specialty />
      <Bio />
    </>
  );
};

export default Home;
