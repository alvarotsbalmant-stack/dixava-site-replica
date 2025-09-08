import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductDetail } from '@/hooks/useProductDetail';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/contexts/AnalyticsContext';

// LAZY LOADING REAL - carrega apenas desktop OU mobile sob demanda
const ProductLayout = lazy(() => import('@/components/Product/Layout/ProductLayout'));
const ProductPageMobileMercadoLivre = lazy(() => import('@/components/Product/Mobile/ProductPageMobileMercadoLivre'));
const ProductCTABottom = lazy(() => import('@/components/Product/ProductCTABottom'));
import ProductSEO from '@/components/Product/ProductSEO';
import SKUBreadcrumb from '@/components/SKU/SKUBreadcrumb';
import { SKUNavigation } from '@/hooks/useProducts/types';

const ProductPageSKU = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { product, skuNavigation, loading, error } = useProductDetail(id);
  
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { trackProductView } = useAnalytics();
  
  // DETECÇÃO DE DISPOSITIVO para lazy loading real
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Debug para verificar detecção
  useEffect(() => {
    console.log('🔍 Device Detection:', {
      isMobile,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'undefined',
      mediaQueryResult: typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : 'undefined'
    });
  }, [isMobile]);
  
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // CORREÇÃO: Forçar scroll ao topo quando componente mobile carrega
  useEffect(() => {
    if (isMobile && product) {
      // Aguardar um tick para garantir que o componente mobile foi renderizado
      const timer = setTimeout(() => {
        console.log('🔧 [ProductPageSKU] Forçando scroll ao topo para mobile');
        window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, product]);

  // Implementar scroll restoration
  useEffect(() => {
    return () => {
      // Cleanup quando sair da página de produto
    };
  }, [location.pathname]);

  // Track product view when product loads
  useEffect(() => {
    if (product && id) {
      trackProductView(id, product.name, product.price);
    }
  }, [product, id, trackProductView]);



  const handleBack = async () => {
    navigate(-1);
  };

  const handleCartOpen = () => setShowCart(true);
  const handleAuthOpen = () => setShowAuthModal(true);

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product);
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao seu carrinho.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  // Determinar se deve mostrar componentes de SKU
  const shouldShowSKUComponents = () => {
    if (!product) return false;
    return product.product_type === 'master' || product.product_type === 'sku';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <ProfessionalHeader 
          onCartOpen={handleCartOpen}
          onAuthOpen={handleAuthOpen}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <ProfessionalHeader 
          onCartOpen={handleCartOpen}
          onAuthOpen={handleAuthOpen}
          showNavigation={false}
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6 text-center">
            O produto que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProductSEO product={product} />
      
      <ProfessionalHeader 
        onCartOpen={handleCartOpen}
        onAuthOpen={handleAuthOpen}
        showNavigation={false}
      />

      <main className="pt-20 md:pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="w-full max-w-6xl">
          {/* Breadcrumb com suporte a SKUs */}
          <div className="mb-4">
            {shouldShowSKUComponents() && skuNavigation ? (
              <SKUBreadcrumb skuNavigation={skuNavigation} />
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-0 h-auto font-normal hover:text-red-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              </div>
            )}
          </div>

           {/* LAZY LOADING REAL - carrega apenas desktop OU mobile */}
          {(() => {
            console.log('🚀 Lazy Loading Decision:', { isMobile, component: isMobile ? 'Mobile' : 'Desktop' });
            
            return isMobile ? (
              <Suspense fallback={
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              }>
                <ProductPageMobileMercadoLivre 
                  product={product}
                  skuNavigation={skuNavigation}
                  onAddToCart={handleAddToCart}
                />
              </Suspense>
            ) : (
              <Suspense fallback={
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              }>
                <ProductLayout
                  product={product}
                  skuNavigation={skuNavigation}
                  onAddToCart={handleAddToCart}
                />
              </Suspense>
            );
          })()}
        </div>
        </div>
      </main>

      {/* CTA Bottom - Desktop com lazy loading */}
      {!isMobile && (
        <Suspense fallback={null}>
          <ProductCTABottom 
            product={product}
            onAddToCart={handleAddToCart}
          />
        </Suspense>
      )}

      {/* Modais */}
      <Cart 
        showCart={showCart}
        setShowCart={setShowCart}
      />

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default ProductPageSKU;

