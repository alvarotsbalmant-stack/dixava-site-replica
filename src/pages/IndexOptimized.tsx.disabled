import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import { useCart } from '@/contexts/CartContext';
import Footer from '@/components/Footer';
import { FloatingActionButton } from '@/components/Retention/FloatingActionButton';
import { useScrollCoins } from '@/hooks/useScrollCoins';

// Hooks otimizados
import { useOptimizedHomepageLayout } from '@/hooks/useOptimizedHomepageLayout';
import { useOptimizedProducts } from '@/hooks/useOptimizedProducts';

// Componentes otimizados
import { HomepageSkeleton } from '@/components/skeletons/AdvancedSkeletons';
import { PageErrorBoundary } from '@/components/ErrorBoundaries/AdvancedErrorBoundary';

// Componentes existentes
import SectionRenderer from '@/components/HomePage/SectionRenderer';
import SpecialSectionRenderer from '@/components/SpecialSections/SpecialSectionRenderer';

// Lazy load AdminPanel para reduzir bundle inicial
const AdminPanel = lazy(() => import('./Admin'));

const IndexOptimized = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Remove coins for now as useScrollCoins returns void
  const coins = 0;

  // Usar layout otimizado com view unificada
  const { 
    layoutItems, 
    isLoading: layoutLoading, 
    error: layoutError,
    isOptimized 
  } = useOptimizedHomepageLayout();

  // Usar produtos otimizados
  const { 
    data: products, 
    isLoading: productsLoading, 
    error: productsError 
  } = useOptimizedProducts();

  // Handlers
  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const openAuthModal = useCallback((mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  // Verificar se é admin
  const isAdmin = useMemo(() => {
    return user?.email === 'admin@utigames.com.br';
  }, [user?.email]);

  // Loading state otimizado
  if (authLoading || layoutLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <ProfessionalHeader 
          onAuthClick={() => openAuthModal('login')}
          cartItemsCount={cart.length}
          onCartClick={() => setIsCartOpen(true)}
        />
        <HomepageSkeleton />
        <Footer />
      </div>
    );
  }

  // Error state otimizado
  if (layoutError) {
    return (
      <PageErrorBoundary>
        <div className="p-8 text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Erro no Layout</h1>
          <p className="text-gray-600 mb-4">Houve um problema ao carregar o layout da página.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      </PageErrorBoundary>
    );
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <ProfessionalHeader 
          onAuthClick={() => openAuthModal('login')}
          cartItemsCount={cart.length}
          onCartClick={() => setIsCartOpen(true)}
        />

        {/* Indicador de otimização (apenas em dev) */}
        {process.env.NODE_ENV === 'development' && isOptimized && (
          <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded text-xs">
            🚀 Otimizado (View Unificada)
          </div>
        )}

        <main className="relative">
          {/* Renderizar seções do layout otimizado */}
          {layoutItems.map((layoutItem) => {
            // Seções fixas (hero, banners, etc.)
            if (!layoutItem.section_key.startsWith('product_section_') && 
                !layoutItem.section_key.startsWith('special_section_')) {
              return (
                <SectionRenderer
                  key={layoutItem.id}
                  sectionKey={layoutItem.section_key}
                />
              );
            }

            // Seções de produtos
            if (layoutItem.section_key.startsWith('product_section_') && layoutItem.section_data) {
              return (
                <SectionRenderer
                  key={layoutItem.id}
                  sectionKey={layoutItem.section_key}
                  sectionData={layoutItem.section_data}
                />
              );
            }

            // Seções especiais
            if (layoutItem.section_key.startsWith('special_section_') && layoutItem.section_data) {
              return (
                <SpecialSectionRenderer
                  key={layoutItem.id}
                  section={layoutItem.section_data}
                />
              );
            }

            return null;
          })}
        </main>

        {/* Admin Panel (lazy loaded) */}
        {isAdmin && (
          <Suspense fallback={<div className="fixed bottom-4 right-4 p-4 bg-gray-800 rounded">Carregando Admin...</div>}>
            <AdminPanel />
          </Suspense>
        )}

        {/* Floating Action Button */}
        <FloatingActionButton />

        {/* Footer */}
        <Footer />

        {/* Modais */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      </div>
    </PageErrorBoundary>
  );
};

export default IndexOptimized;

