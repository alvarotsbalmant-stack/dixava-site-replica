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

// Usar hook otimizado que tenta usar view unificada
import { useOptimizedHomepageLayoutFixed } from '@/hooks/useOptimizedHomepageLayoutFixed';
import { useProductSections } from '@/hooks/useProductSections';
import { useSpecialSections } from '@/hooks/useSpecialSections';

// Componentes existentes
import SectionRenderer from '@/components/HomePage/SectionRenderer';
import SpecialSectionRenderer from '@/components/SpecialSections/SpecialSectionRenderer';
import LoadingState from '@/components/HomePage/LoadingState';
import ErrorState from '@/components/HomePage/ErrorState';

// Lazy load AdminPanel para reduzir bundle inicial
const AdminPanel = lazy(() => import('./Admin'));

const IndexWithBackendOptimizations = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { cartItems, isCartOpen, setIsCartOpen } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { coins } = useScrollCoins();

  // Usar hooks otimizados separados
  const {
    layoutItems,
    loading: layoutLoading,
    error: layoutError
  } = useOptimizedHomepageLayoutFixed();
  
  const { sections: productSections, loading: sectionsLoading } = useProductSections();
  const { sections: specialSections, loading: specialSectionsLoading } = useSpecialSections();

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

  // Calcular estados combinados
  const isLoading = layoutLoading || sectionsLoading || specialSectionsLoading;
  const error = layoutError;

  // Loading state
  if (authLoading || isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <ProfessionalHeader 
        onAuthClick={openAuthModal}
        cartItemsCount={cartItems.length}
        onCartClick={() => setIsCartOpen(true)}
        coins={coins}
      />

      {/* Indicador de que está usando otimizações de backend */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded text-xs">
          🔧 Backend Otimizado
        </div>
      )}

      <main className="relative">
        {/* Renderizar seções do layout */}
        {layoutItems.map((layoutItem) => {
          // Seções fixas (hero, banners, etc.)
          if (!layoutItem.section_key.startsWith('product_section_') && 
              !layoutItem.section_key.startsWith('special_section_')) {
            return (
              <SectionRenderer
                key={layoutItem.id}
                sectionKey={layoutItem.section_key}
                displayOrder={layoutItem.display_order}
                isVisible={layoutItem.is_visible}
              />
            );
          }

          // Seções de produtos
          if (layoutItem.section_key.startsWith('product_section_')) {
            const sectionId = layoutItem.section_key.replace('product_section_', '');
            const productSection = productSections.find(ps => ps.id === sectionId);
            
            return (
              <SectionRenderer
                key={layoutItem.id}
                sectionKey={layoutItem.section_key}
                displayOrder={layoutItem.display_order}
                isVisible={layoutItem.is_visible}
                sectionData={productSection}
              />
            );
          }

          // Seções especiais
          if (layoutItem.section_key.startsWith('special_section_')) {
            const sectionId = layoutItem.section_key.replace('special_section_', '');
            const specialSection = specialSections.find(ss => ss.id === sectionId);
            
            if (specialSection) {
              return (
                <SpecialSectionRenderer
                  key={layoutItem.id}
                  sectionId={sectionId}
                  sectionData={specialSection}
                  displayOrder={layoutItem.display_order}
                />
              );
            }
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
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  );
};

export default IndexWithBackendOptimizations;

