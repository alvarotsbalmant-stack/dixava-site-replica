
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/hooks/useProducts";
import SectionTitle from "@/components/SectionTitle";
import { cn } from "@/lib/utils";
import { useSimpleHorizontalScroll } from "@/hooks/useSimpleHorizontalScroll";

interface FeaturedProductsSectionProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product) => void;
  title: string;
  titlePart1?: string;
  titlePart2?: string;
  titleColor1?: string;
  titleColor2?: string;
  viewAllLink?: string;
  reduceTopSpacing?: boolean;
  sectionKey?: string; // ← CRÍTICO: Adicionar sectionKey
}

const FeaturedProductsSection = ({
  products,
  loading,
  onAddToCart,
  title,
  titlePart1,
  titlePart2,
  titleColor1,
  titleColor2,
  viewAllLink = "/categoria/inicio",
  reduceTopSpacing = false,
  sectionKey = "", // ← CRÍTICO: Adicionar sectionKey
}: FeaturedProductsSectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Usa novo sistema simples de scroll horizontal
  const scrollContainerRef = useSimpleHorizontalScroll(sectionKey || 'featured-products', true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const handleViewAllClick = () => {
    navigate(viewAllLink);
  };

  // Função para converter cor hex para rgba com transparência (sistema adaptativo)
  const hexToRgba = (hex: string, alpha: number) => {
    // Background padrão das seções normais (branco puro para naturalidade)
    if (!hex || hex.trim() === '') {
      return `rgba(255, 255, 255, ${alpha})`; // Branco puro como o site
    }
    
    const cleanHex = hex.replace('#', '').toLowerCase().trim();
    
    if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(cleanHex)) {
      return `rgba(255, 255, 255, ${alpha})`; // Branco puro como fallback
    }
    
    let r, g, b;
    
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Função para detectar cards cortados com sistema adaptativo
  // Sistema GameStop: Gradientes fixos simples
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  // Function to handle product click - always navigate to product page
  const handleProductCardClick = useCallback(async (productId: string) => {
    navigate(`/produto/${productId}`);
  }, [navigate]);

  // Check scroll position and update button states
  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Tolerância de 1px para evitar problemas de arredondamento
    const tolerance = 1;
    
    const newCanScrollLeft = scrollLeft > tolerance;
    const newCanScrollRight = scrollLeft < (scrollWidth - clientWidth - tolerance);
    
    // Debug info removido para produção
    
    setCanScrollLeft(newCanScrollLeft);
    setCanScrollRight(newCanScrollRight);
  }, []);

  // Função ultra-otimizada para scroll suave sem travamentos
  const handleScrollOptimized = useCallback(() => {
    // Botões atualizados imediatamente (operação leve)
    requestAnimationFrame(() => {
      checkScrollButtons();
    });
  }, [checkScrollButtons]);

  // Scroll functions
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

  // Check scroll buttons when products change or component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollButtons();
    }, 150);
    return () => clearTimeout(timer);
  }, [products, checkScrollButtons]);

  // Add scroll event listener (simplificado)
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
  }, [handleScrollOptimized, checkScrollButtons, products]);

  // Effect para detectar mudanças no tamanho da janela
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

  if (loading) {
    // Render loading state if needed
    return (
      <section className={reduceTopSpacing ? "py-4 md:py-6 bg-background" : "py-12 md:py-16 bg-background"}>
        <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center py-16 text-muted-foreground">
            Carregando produtos...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={reduceTopSpacing ? "py-4 md:py-6 bg-background" : "py-8 md:py-12 bg-background"}>
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-2">
          <SectionTitle 
            title={title}
            titlePart1={titlePart1}
            titlePart2={titlePart2}
            titleColor1={titleColor1}
            titleColor2={titleColor2}
            className="mb-0" 
          />
        </div>

        {/* Products Grid / Scroll Container */}
        {products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Nenhum produto encontrado nesta categoria.
          </div>
        ) : (
          <div className="relative group">
            {/* Sistema GameStop: Gradientes fixos nas extremidades */}
            {!isMobile && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {/* Gradiente esquerdo fixo */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-16 opacity-90"
                  style={{ 
                    background: `linear-gradient(to right, ${hexToRgba('#ffffff', 1.0)} 0%, ${hexToRgba('#ffffff', 0.95)} 30%, ${hexToRgba('#ffffff', 0.7)} 60%, transparent 100%)`
                  }}
                />
                
                {/* Gradiente direito fixo */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-16 opacity-90"
                  style={{ 
                    background: `linear-gradient(to left, ${hexToRgba('#ffffff', 1.0)} 0%, ${hexToRgba('#ffffff', 0.95)} 30%, ${hexToRgba('#ffffff', 0.7)} 60%, transparent 100%)`
                  }}
                />
              </div>
            )}

            {/* Left Navigation Button */}
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg border border-gray-200 transition-opacity duration-200"
                onClick={scrollLeft}
                aria-label="Produtos anteriores"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Right Navigation Button */}
            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg border border-gray-200 transition-opacity duration-200"
                onClick={scrollRight}
                aria-label="Próximos produtos"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            <div
              ref={scrollContainerRef}
              className={cn(
                "w-full overflow-x-auto overflow-y-hidden pb-4 pt-2", // Restored overflow-x-auto for scrolling
                "overscroll-behavior-x-contain"
              )}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#1f2937 transparent", // Preto fosco
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                touchAction: "pan-x pan-y"
              } as React.CSSProperties}
            >
              <div 
                className="flex card-grid-gap min-w-max px-1 py-1"
                style={{
                  // FORÇA O CORTE DO ÚLTIMO CARD - CARACTERÍSTICAS ESPECÍFICAS DA VERSÃO
                  width: 'calc(100% + 100px)', // Estende além do container para forçar corte
                  paddingRight: '120px' // Garante que último card seja parcialmente visível
                }}
              >
                {/* Card fantasma GameStop - empurra primeiro card para dentro do gradiente */}
                {!isMobile && (
                  <div className="flex-shrink-0 w-[29px] md:w-[35px] h-full" aria-hidden="true" />
                )}
                
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    data-card
                    className="flex-shrink-0 w-[170px] md:w-[200px]"
                  >
                    <ProductCard
                      product={product}
                      onCardClick={handleProductCardClick}
                      onAddToCart={onAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductsSection;
