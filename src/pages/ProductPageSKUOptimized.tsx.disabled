import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useProductPrefetch } from '@/hooks/useProductPrefetch';

import { saveScrollPosition, restoreScrollPosition } from '@/lib/scrollRestorationManager';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';

// Componentes críticos carregados imediatamente
import ProductHero from '@/components/Product/ProductHero';
import ProductLayout from '@/components/Product/Layout/ProductLayout';
import ProductSEO from '@/components/Product/ProductSEO';
import SKUBreadcrumb from '@/components/SKU/SKUBreadcrumb';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Skeleton components
import { ProductPageSkeletonInstant, ProductPageSkeletonMobile, useIsMobile } from '@/components/ProductPageSkeletonInstant';

// Componentes não críticos carregados sob demanda
const ProductTabsEnhanced = lazy(() => import('@/components/Product/ProductTabsEnhanced'));
const RelatedProductsSection = lazy(() => import('@/components/Product/RelatedProductsSection'));
const ProductFAQ = lazy(() => import('@/components/Product/ProductFAQ'));
const ProductGuarantees = lazy(() => import('@/components/Product/ProductGuarantees'));
const ProductCTABottom = lazy(() => import('@/components/Product/ProductCTABottom'));
const PlatformSelector = lazy(() => import('@/components/SKU/PlatformSelector'));
const SKUPriceComparison = lazy(() => import('@/components/SKU/SKUPriceComparison'));

// Mobile Components - lazy loading
const ProductHeroMobile = lazy(() => import('@/components/Product/Mobile/ProductHeroMobile'));
const ProductTabsMobile = lazy(() => import('@/components/Product/Mobile/ProductTabsMobile'));
const ProductCTABottomMobile = lazy(() => import('@/components/Product/Mobile/ProductCTABottomMobile'));
const RelatedProductsMobile = lazy(() => import('@/components/Product/Mobile/RelatedProductsMobile'));

// Componente de fallback para Suspense
const ComponentSkeleton = ({ height = "200px" }: { height?: string }) => (
  <div className="animate-pulse bg-gray-200 rounded-lg" style={{ height }} />
);

const ProductPageSKUOptimized = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log('[ProductPageSKU] Iniciando com ID:', id);
  console.log('[ProductPageSKU] Location:', location.pathname);
  
  const { getCachedProduct } = useProductPrefetch();
  const { product, skuNavigation, loading, error } = useProductDetail(id);
  const { addToCart, items, updateQuantity, getCartTotal, getCartItemsCount } = useCart();
  const { toast } = useToast();
  
  const [viewingCount, setViewingCount] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const isMobile = useIsMobile();

  // Verificar se produto está no cache para carregamento instantâneo
  const cachedProduct = id ? getCachedProduct(id) : null;
  const displayProduct = cachedProduct || product;

  // Controlar skeleton loading
  useEffect(() => {
    if (displayProduct || error) {
      // Pequeno delay para transição suave
      const timer = setTimeout(() => {
        setShowSkeleton(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [displayProduct, error]);

  // Implementar scroll restoration
  useEffect(() => {
    return () => {
      saveScrollPosition(location.pathname);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && displayProduct) {
      restoreScrollPosition(location.pathname);
    }
  }, [loading, displayProduct, location.pathname]);

  // Simular visualizações
  useEffect(() => {
    if (displayProduct) {
      const interval = setInterval(() => {
        setViewingCount(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const newCount = Math.max(8, Math.min(25, prev + change));
          return newCount;
        });
      }, 3000);

      setViewingCount(Math.floor(Math.random() * 8) + 12);
      return () => clearInterval(interval);
    }
  }, [displayProduct]);

  // Handlers
  const handleAddToCart = (quantity: number = 1) => {
    if (!displayProduct) return;

    try {
      addToCart(displayProduct, quantity);
      toast({
        title: "Produto adicionado ao carrinho!",
        description: `${displayProduct.name} foi adicionado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar produto",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  const handleBuyNow = () => {
    if (!displayProduct) return;
    
    handleAddToCart(1);
    setShowCart(true);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Loading states
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
            <p className="text-gray-600 mb-6">O produto que você está procurando não existe ou foi removido.</p>
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar skeleton se não há produto e está carregando
  if (showSkeleton && !displayProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader />
        {isMobile ? <ProductPageSkeletonMobile /> : <ProductPageSkeletonInstant />}
      </div>
    );
  }

  // Renderizar página com produto
  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO */}
      {displayProduct && <ProductSEO product={displayProduct} />}
      
      {/* Header */}
      <ProfessionalHeader />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <SKUBreadcrumb product={displayProduct} />
        </div>
      </div>

      {/* Main Content */}
      <ProductLayout>
        {/* Desktop Hero */}
        <div className="hidden md:block">
          {displayProduct && (
            <ProductHero
              product={displayProduct}
              viewingCount={viewingCount}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          )}
        </div>

        {/* Mobile Hero - Lazy loaded */}
        <div className="block md:hidden">
          <Suspense fallback={<ComponentSkeleton height="400px" />}>
            {displayProduct && (
              <ProductHeroMobile
                product={displayProduct}
                viewingCount={viewingCount}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            )}
          </Suspense>
        </div>

        {/* Platform Selector - Lazy loaded */}
        <Suspense fallback={<ComponentSkeleton height="60px" />}>
          {displayProduct && skuNavigation && (
            <PlatformSelector
              product={displayProduct}
              skuNavigation={skuNavigation}
            />
          )}
        </Suspense>

        {/* Price Comparison - Lazy loaded */}
        <Suspense fallback={<ComponentSkeleton height="120px" />}>
          {displayProduct && skuNavigation && (
            <SKUPriceComparison
              product={displayProduct}
              skuNavigation={skuNavigation}
            />
          )}
        </Suspense>

        {/* Product Tabs - Desktop - Lazy loaded */}
        <div className="hidden md:block">
          <Suspense fallback={<ComponentSkeleton height="300px" />}>
            {displayProduct && (
              <ProductTabsEnhanced product={displayProduct} />
            )}
          </Suspense>
        </div>

        {/* Product Tabs - Mobile - Lazy loaded */}
        <div className="block md:hidden">
          <Suspense fallback={<ComponentSkeleton height="250px" />}>
            {displayProduct && (
              <ProductTabsMobile product={displayProduct} />
            )}
          </Suspense>
        </div>

        {/* Guarantees - Lazy loaded */}
        <Suspense fallback={<ComponentSkeleton height="150px" />}>
          {displayProduct && <ProductGuarantees />}
        </Suspense>

        {/* FAQ - Lazy loaded */}
        <Suspense fallback={<ComponentSkeleton height="200px" />}>
          {displayProduct && <ProductFAQ product={displayProduct} />}
        </Suspense>

        {/* Related Products - Desktop - Lazy loaded */}
        <div className="hidden md:block">
          <Suspense fallback={<ComponentSkeleton height="400px" />}>
            {displayProduct && (
              <RelatedProductsSection productId={displayProduct.id} />
            )}
          </Suspense>
        </div>

        {/* Related Products - Mobile - Lazy loaded */}
        <div className="block md:hidden">
          <Suspense fallback={<ComponentSkeleton height="350px" />}>
            {displayProduct && (
              <RelatedProductsMobile productId={displayProduct.id} />
            )}
          </Suspense>
        </div>
      </ProductLayout>

      {/* Bottom CTA - Desktop - Lazy loaded */}
      <div className="hidden md:block">
        <Suspense fallback={<div className="h-16 bg-white border-t" />}>
          {displayProduct && (
            <ProductCTABottom
              product={displayProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          )}
        </Suspense>
      </div>

      {/* Bottom CTA - Mobile - Lazy loaded */}
      <div className="block md:hidden">
        <Suspense fallback={<div className="h-16 bg-white border-t" />}>
          {displayProduct && (
            <ProductCTABottomMobile
              product={displayProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          )}
        </Suspense>
      </div>

      {/* Modals */}
      <Cart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)}
        items={items}
        updateQuantity={updateQuantity}
        total={getCartTotal()}
        itemsCount={getCartItemsCount()}
      />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default ProductPageSKUOptimized;

