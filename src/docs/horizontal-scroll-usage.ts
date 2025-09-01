/**
 * GUIA DE USO - Sistema de Scroll Horizontal
 * 
 * Este arquivo documenta como usar o sistema de restauração de scroll horizontal
 * para seções de produtos e carrosséis.
 */

// =======================
// 1. USO AUTOMÁTICO (Recomendado)
// =======================

// O sistema detecta automaticamente elementos com estas características:
// - data-section="products" ou data-section="jogos-da-galera"
// - classes: .overflow-x-auto, .overflow-x-scroll, .horizontal-scroll
// - classes: .product-carousel, .products-grid, .carousel-container
// - data-testid: data-testid="product-carousel" ou data-testid="horizontal-scroll"

// Exemplo de uso automático:
/*
<div 
  data-section="products" 
  className="overflow-x-auto flex gap-4 p-4"
>
  {produtos.map(produto => (
    <ProductCard key={produto.id} produto={produto} />
  ))}
</div>
*/

// =======================
// 2. USO COM COMPONENTE WRAPPER
// =======================

// Para garantir rastreamento, use o componente HorizontalScrollSection:
/*
import HorizontalScrollSection from '@/components/HorizontalScrollSection';

<HorizontalScrollSection 
  sectionId="products"
  className="flex gap-4 p-4"
>
  {produtos.map(produto => (
    <ProductCard key={produto.id} produto={produto} />
  ))}
</HorizontalScrollSection>
*/

// =======================
// 3. USO COM HOOK MANUAL
// =======================

// Para controle total, use o hook diretamente:
/*
import { useHorizontalScrollTracking } from '@/hooks/useHorizontalScrollTracking';

const ProductCarousel = () => {
  const scrollRef = useHorizontalScrollTracking(true);
  
  return (
    <div 
      ref={scrollRef}
      className="overflow-x-auto flex gap-4"
    >
      {produtos.map(produto => (
        <ProductCard key={produto.id} produto={produto} />
      ))}
    </div>
  );
};
*/

// =======================
// 4. RASTREAMENTO MÚLTIPLO
// =======================

// Para rastrear múltiplas seções por seletor:
/*
import { useMultipleHorizontalScrollTracking } from '@/hooks/useHorizontalScrollTracking';

const HomePage = () => {
  // Rastreia todas as seções de produtos da página
  useMultipleHorizontalScrollTracking([
    '[data-section="products"]',
    '[data-section="jogos-da-galera"]',
    '.product-carousel'
  ]);
  
  return (
    <div>
      // Suas seções aqui
    </div>
  );
};
*/

// =======================
// 5. DEBUG E MONITORAMENTO
// =======================

// No console do navegador, use estes comandos para debug:
// window.horizontalScrollManager.debugHorizontalPositions() - Mostra todas as posições salvas
// window.horizontalScrollManager.trackElement(element) - Força rastreamento de um elemento
// window.horizontalScrollManager.untrackElement(element) - Remove elemento do rastreamento

// =======================
// 6. FUNCIONAMENTO
// =======================

// ✅ Salvamento automático a cada 20ms de todas as posições horizontais
// ✅ Restauração automática ao voltar para a página (após 300ms de delay)
// ✅ Limpeza automática ao navegar para nova página
// ✅ Detecção automática de elementos com scroll horizontal
// ✅ Suporte a múltiplas seções por página
// ✅ Sistema robusto com fallbacks e retry

export const HorizontalScrollUsageGuide = {
  // Este objeto é apenas para documentação
  // O sistema funciona automaticamente quando implementado
};