import { useState, useEffect, useRef } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  debounceMs?: number;
}

interface ScrollDirectionState {
  scrollDirection: 'up' | 'down';
  isScrolled: boolean;
  scrollY: number;
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}): ScrollDirectionState => {
  const { threshold = 25, debounceMs = 16 } = options; // Aumentado de 10 para 25px
  
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const lastScrollY = useRef(0);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isThrottled = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      // Throttling para 60fps
      if (isThrottled.current) return;
      isThrottled.current = true;
      
      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        
        // Atualizar posição do scroll
        setScrollY(currentScrollY);
        
        // Determinar se está scrollado
        setIsScrolled(currentScrollY > threshold);
        
        // Determinar direção apenas se houve movimento significativo
        const scrollDifference = currentScrollY - lastScrollY.current;
        
        if (Math.abs(scrollDifference) > threshold) {
          // Debounce para evitar mudanças muito frequentes
          if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
          }
          
          debounceTimer.current = setTimeout(() => {
            if (scrollDifference > 0) {
              setScrollDirection('down');
            } else {
              setScrollDirection('up');
            }
            lastScrollY.current = currentScrollY;
          }, debounceMs);
        }
        
        isThrottled.current = false;
      });
    };

    // Configurar listener com passive para melhor performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Executar uma vez para definir estado inicial
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [threshold, debounceMs]);

  return {
    scrollDirection,
    isScrolled,
    scrollY
  };
};

export default useScrollDirection;

