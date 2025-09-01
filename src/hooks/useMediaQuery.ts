import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries
 * @param query - Media query string (ex: '(max-width: 768px)')
 * @returns boolean - true se a media query corresponde
 */
export const useMediaQuery = (query: string): boolean => {
  // Inicializar com false para desktop por padrão
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);
    
    // Create event listener
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener
    mediaQuery.addEventListener('change', handler);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
};

