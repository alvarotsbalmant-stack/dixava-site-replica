import React, { useRef, useEffect } from 'react';
import { useSimpleHorizontalScroll } from '@/hooks/useSimpleHorizontalScroll';

interface HorizontalScrollSectionProps {
  children: React.ReactNode;
  sectionId?: string;
  className?: string;
  autoTrack?: boolean;
}

/**
 * Componente wrapper para seções com scroll horizontal
 * Automaticamente rastreia a posição de scroll horizontal
 */
const HorizontalScrollSection: React.FC<HorizontalScrollSectionProps> = ({
  children,
  sectionId,
  className = '',
  autoTrack = true
}) => {
  const elementRef = useSimpleHorizontalScroll(sectionId || 'horizontal-section', autoTrack) as React.RefObject<HTMLDivElement>;

  return (
    <div
      ref={elementRef}
      data-carousel-id={sectionId}
      className={`overflow-x-auto ${className}`}
    >
      {children}
    </div>
  );
};

export default HorizontalScrollSection;