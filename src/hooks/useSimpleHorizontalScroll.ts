import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import simpleHorizontalScroll from '@/lib/simpleHorizontalScroll';

/**
 * Hook simples para rastreamento de scroll horizontal
 * 
 * @param carouselId - ID único do carrossel (ex: "produtos-destaque", "ps5-games")
 * @param enabled - Se o rastreamento está habilitado (padrão: true)
 */
export const useSimpleHorizontalScroll = (carouselId: string, enabled: boolean = true) => {
  const elementRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    // Define página atual
    const currentPage = location.pathname + location.search;
    simpleHorizontalScroll.setCurrentPage(currentPage);
  }, [location]);

  useEffect(() => {
    if (!enabled || !carouselId) return;

    const element = elementRef.current;
    if (!element) return;

    // Adiciona data-carousel-id para identificação
    element.setAttribute('data-carousel-id', carouselId);

    // Inicia rastreamento
    simpleHorizontalScroll.trackCarousel(element, carouselId);

    // Cleanup
    return () => {
      simpleHorizontalScroll.untrackCarousel(carouselId);
      if (element) {
        element.removeAttribute('data-carousel-id');
      }
    };
  }, [carouselId, enabled]);

  return elementRef;
};

