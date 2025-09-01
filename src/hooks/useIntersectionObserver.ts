import { useEffect, useRef, RefObject } from 'react';

// Hook para Intersection Observer
export const useIntersectionObserver = <T extends HTMLElement = HTMLDivElement>(
  elementRef: RefObject<T>,
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Criar observer
    observerRef.current = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    // Observar elemento
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef, callback, options]);

  return observerRef.current;
};

