import React from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title?: string;
  titlePart1?: string; // Primeira parte do título (ex: "Most Popular")
  titlePart2?: string; // Segunda parte do título (ex: "Trading Cards")
  titleColor1?: string; // Cor da primeira parte
  titleColor2?: string; // Cor da segunda parte
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  alignment?: 'left' | 'center' | 'right';
  onViewAllClick?: () => void; // Função para clique no "Ver Todos"
  showViewAllButton?: boolean; // Controla se mostra o botão
}

// Reusable Section Title Component based on GameStop style with bicolor support
const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  titlePart1,
  titlePart2,
  titleColor1,
  titleColor2,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  alignment = 'left',
  onViewAllClick,
  showViewAllButton = true
}) => {
  // Verifica se deve usar sistema bicolor ou título simples
  const useBicolorTitle = titlePart1 || titlePart2;
  const useSimpleTitle = title && !useBicolorTitle;

  if (!useBicolorTitle && !useSimpleTitle) {
    return null;
  }

  const alignmentClass = 
    alignment === 'center' ? 'justify-center text-center' :
    alignment === 'right' ? 'justify-end text-right' : 'justify-start text-left';

  return (
    <div className={cn(`flex items-center justify-between mb-2 px-4 md:px-0`, className)}>
      <div className="flex-1">
        {useBicolorTitle ? (
          // Sistema bicolor estilo GameStop - RESPONSIVO
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <h2 className={cn(
              "text-xl md:text-4xl font-semibold leading-tight tracking-tight",
              titleClassName
            )} style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.24px' }}>
              {titlePart1 && (
                <span style={{ color: titleColor1 || '#000000', fontWeight: '700', fontFamily: 'Poppins, sans-serif' }} className="block sm:inline">
                  {titlePart1}
                </span>
              )}
              {titlePart1 && titlePart2 && <span className="hidden sm:inline" style={{ fontWeight: '700' }}> </span>}
              {titlePart2 && (
                <span style={{ color: titleColor2 || '#A4A4A4', fontWeight: '700', fontFamily: 'Poppins, sans-serif' }} className="block sm:inline">
                  {titlePart2}
                </span>
              )}
            </h2>
          </div>
        ) : (
          // Título simples (compatibilidade com versão anterior)
          <h2 className={cn(
            "text-xl md:text-4xl font-semibold leading-tight tracking-tight text-black",
            titleClassName
          )} style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.24px' }}>
            {title}
          </h2>
        )}
        
        {subtitle && (
          <p className={cn(
            "text-sm md:text-base text-muted-foreground mt-1",
            subtitleClassName
          )}>
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Botão Shop All estilo GameStop */}
      {showViewAllButton && (
        <button 
          onClick={onViewAllClick}
          className="bg-black text-white rounded font-semibold hover:bg-gray-800 transition-colors duration-200 flex-shrink-0 ml-4 flex items-center justify-center" 
          style={{ 
            border: '2px solid #000000',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            lineHeight: '1',
            height: '40px',
            minWidth: '78px',
            padding: '7px 9px'
          }}
        >
          Ver Todos
        </button>
      )}
    </div>
  );
};

export default SectionTitle;

