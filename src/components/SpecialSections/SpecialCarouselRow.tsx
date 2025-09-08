import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/hooks/useProducts';
import { useSimpleHorizontalScroll } from '@/hooks/useSimpleHorizontalScroll';

interface CarouselRowConfig {
  title?: string;
  titlePart1?: string; // Primeira parte do título (ex: "Most Popular")
  titlePart2?: string; // Segunda parte do título (ex: "Trading Cards")
  titleColor1?: string; // Cor da primeira parte
  titleColor2?: string; // Cor da segunda parte
  products: Product[]; // Usar Product[] em vez do formato customizado
  showTitle?: boolean;
  titleAlignment?: 'left' | 'center' | 'right';
  // New color customization properties (removed carousel_background_color - using sectionBackgroundColor prop)
  carousel_title_color?: string;
  view_all_button_bg_color?: string;
  view_all_button_text_color?: string;
  scrollbar_color?: string;
  scrollbar_hover_color?: string;
}

interface SpecialCarouselRowProps {
  config: CarouselRowConfig;
  sectionBackgroundColor?: string; // Cor de fundo da seção para gradiente adaptativo
  onCardClick?: (productId: string) => void;
  sectionId?: string; // ID da seção especial para navegação
}

const SpecialCarouselRow: React.FC<SpecialCarouselRowProps> = React.memo(({
  config,
  sectionBackgroundColor = '#f3f4f6', // Default para cinza claro
  onCardClick,
  sectionId, // ID da seção especial
}) => {
  const navigate = useNavigate();
  // Gera chave única e estável para o carrossel especial
  const generateCarouselKey = () => {
    const titlePart = config.title || `${config.titlePart1 || ''}_${config.titlePart2 || ''}`;
    const cleanTitle = titlePart.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `special_carousel_${cleanTitle}`;
  };

  // Sistema simples de scroll horizontal para seções especiais
  const sectionKey = generateCarouselKey();
  const scrollContainerRef = useSimpleHorizontalScroll(sectionKey, true);
  
  // Estados para controle dos botões de scroll (igual às seções normais)
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Sistema GameStop: Gradientes fixos simples
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Função para converter cor hex para rgba com transparência
  const hexToRgba = (hex: string, alpha: number) => {
    // Se não há cor ou é string vazia, usa fallback baseado na cor da seção
    if (!hex || hex.trim() === '') {
      return `rgba(243, 244, 246, ${alpha})`; // Fallback cinza claro
    }
    
    // Remove # se presente e converte para lowercase
    const cleanHex = hex.replace('#', '').toLowerCase().trim();
    
    // Verifica se é uma cor hex válida (3 ou 6 caracteres)
    if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(cleanHex)) {
      return `rgba(243, 244, 246, ${alpha})`; // Fallback cinza claro
    }
    
    let r, g, b;
    
    if (cleanHex.length === 3) {
      // Formato #RGB -> #RRGGBB
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
      // Formato #RRGGBB
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Função para verificar posição do scroll e atualizar estados dos botões
  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Tolerância de 1px para evitar problemas de arredondamento
    const tolerance = 1;
    
    const newCanScrollLeft = scrollLeft > tolerance;
    const newCanScrollRight = scrollLeft < (scrollWidth - clientWidth - tolerance);
    
    setCanScrollLeft(newCanScrollLeft);
    setCanScrollRight(newCanScrollRight);
  }, [scrollContainerRef]);

  // Função ultra-otimizada para scroll suave sem travamentos
  const handleScrollOptimized = useCallback(() => {
    // Botões atualizados imediatamente (operação leve)
    requestAnimationFrame(() => {
      checkScrollButtons();
    });
  }, [checkScrollButtons]);

  // Funções de scroll idênticas às seções normais
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: -containerWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: containerWidth,
        behavior: 'smooth'
      });
    }
  };

  // Effects idênticos às seções normais
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollButtons();
    }, 150);
    return () => clearTimeout(timer);
  }, [config.products, checkScrollButtons]);

  // Add scroll event listener (idêntico às seções normais)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Usar a função otimizada
    container.addEventListener('scroll', handleScrollOptimized, { passive: true });
    
    // Verificação inicial
    checkScrollButtons();
    
    return () => {
      container.removeEventListener('scroll', handleScrollOptimized);
    };
  }, [handleScrollOptimized, checkScrollButtons, config.products]);

  // Effect para detectar mudanças no tamanho da janela (idêntico às seções normais)
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        checkScrollButtons();
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollButtons]);

  // Listener de scroll duplicado removido - otimização de performance

  // Função para renderizar o título estilo GameStop (bicolor ou monocolor)
  const renderGameStopTitle = () => {
    if (!config.showTitle) {
      return null;
    }

    // Verifica se deve usar sistema bicolor ou título simples
    const useBicolorTitle = config.titlePart1 || config.titlePart2;
    const useSimpleTitle = config.title && !useBicolorTitle;

    if (!useBicolorTitle && !useSimpleTitle) {
      return null;
    }

    const alignment = config.titleAlignment || 'left';
    const alignmentClass = 
      alignment === 'center' ? 'justify-center text-center' :
      alignment === 'right' ? 'justify-end text-right' : 'justify-start text-left';

    return (
      <div className={`flex items-center justify-between mb-2 px-4 md:px-0`}>
        <div className="flex-1">
          {useBicolorTitle ? (
            // Sistema bicolor estilo GameStop
            <h2 className="text-xl md:text-4xl font-semibold leading-tight tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.24px' }}>
              {config.titlePart1 && (
                <span style={{ color: config.carousel_title_color || config.titleColor1 || '#ffffff', fontWeight: '700', fontFamily: 'Poppins, sans-serif' }}>
                  {config.titlePart1}
                </span>
              )}
              {config.titlePart1 && config.titlePart2 && <span style={{ fontWeight: '700' }}> </span>}
              {config.titlePart2 && (
                <span style={{ color: config.carousel_title_color || config.titleColor2 || '#ffffff', fontWeight: '700', fontFamily: 'Poppins, sans-serif' }}>
                  {config.titlePart2}
                </span>
              )}
            </h2>
          ) : (
            // Título simples (compatibilidade com versão anterior)
            <h2 className="text-xl md:text-4xl font-semibold leading-tight tracking-tight" style={{ 
              fontFamily: 'Poppins, sans-serif', 
              letterSpacing: '-0.24px',
              color: config.carousel_title_color || '#ffffff'
            }}>
              {config.title}
            </h2>
          )}
        </div>
        
        {/* Botão Shop All estilo GameStop */}
        <button 
          onClick={() => {
            if (sectionId) {
              const link = `/secao/special_section_${sectionId}`;
              console.log(`[SpecialCarouselRow] Navegando para: ${link}`);
              navigate(link);
            }
          }}
          className="rounded font-semibold transition-colors duration-200 flex-shrink-0 ml-4 flex items-center justify-center" 
          style={{ 
            backgroundColor: config.view_all_button_bg_color || '#1f2937',
            color: config.view_all_button_text_color || '#ffffff',
            border: `2px solid ${config.view_all_button_bg_color || '#1f2937'}`,
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
      </div>
    );
  };

  if (!config.products || config.products.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {/* GameStop Style Title */}
      {renderGameStopTitle()}

      {/* Carousel Container */}
      <div className="relative group">
        {/* Sistema GameStop: Gradientes fixos nas extremidades */}
        {!isMobile && (
          <div className="absolute inset-0 pointer-events-none z-20">
            {/* Gradiente esquerdo fixo */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-8 opacity-50"
              style={{ 
                background: `linear-gradient(to right, ${hexToRgba(sectionBackgroundColor, 0.8)} 0%, ${hexToRgba(sectionBackgroundColor, 0.4)} 70%, transparent 100%)`
              }}
            />
            
            {/* Gradiente direito fixo */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-8 opacity-50"
              style={{ 
                background: `linear-gradient(to left, ${hexToRgba(sectionBackgroundColor, 0.8)} 0%, ${hexToRgba(sectionBackgroundColor, 0.4)} 70%, transparent 100%)`
              }}
            />
          </div>
        )}
        
        {/* Left Navigation Button (igual às seções normais) */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg border border-gray-200 transition-opacity duration-200 flex items-center justify-center"
            aria-label="Produtos anteriores"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Right Navigation Button (igual às seções normais) */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg border border-gray-200 transition-opacity duration-200 flex items-center justify-center"
            aria-label="Próximos produtos"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Products Scroll Container (otimizado para performance) */}
        <div 
          ref={scrollContainerRef}
          data-carousel-id={sectionKey}
          className="special-carousel-container w-full overflow-x-auto overflow-y-hidden pb-4 pt-2 overscroll-behavior-x-contain"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `${config.scrollbar_color || '#1f2937'} transparent`,
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth"
          } as React.CSSProperties}
        >
          <style>{`
            .special-carousel-container::-webkit-scrollbar {
              height: 6px;
            }
            .special-carousel-container::-webkit-scrollbar-track {
              background: transparent !important;
            }
            .special-carousel-container::-webkit-scrollbar-thumb {
              background-color: ${config.scrollbar_color || '#1f2937'} !important;
              border-radius: 3px;
            }
            .special-carousel-container::-webkit-scrollbar-thumb:hover {
              background-color: ${config.scrollbar_hover_color || '#111827'} !important;
            }
          `}</style>
          <div className="flex card-grid-gap min-w-max px-1 py-1">
            {/* Card fantasma GameStop - empurra primeiro card para dentro do gradiente */}
            {!isMobile && (
              <div className="flex-shrink-0 w-[29px] md:w-[35px] h-full" aria-hidden="true" />
            )}
            
            {(config.products || []).map((product, index) => (
              <div 
                key={`${product.id}-${index}`} 
                data-card
                className="flex-shrink-0 w-[170px] md:w-[200px]"
              >
                <ProductCard
                  product={product}
                  onCardClick={onCardClick || (() => {})}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default SpecialCarouselRow;

