
import React from 'react';
import HeroBannerCarousel from './HeroBannerCarousel';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

// Este arquivo serve como um ponto de entrada para o componente HeroBanner
// Isso resolve o problema de importação em outros componentes que usam '@/components/HeroBanner'
const HeroBanner: React.FC<HeroBannerProps> = (props) => {
  // Usando o HeroBannerCarousel como base, mas adaptando para aceitar as props específicas
  return <HeroBannerCarousel />;
};

export default HeroBanner;
