import React, { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import MobileSearchBar from '@/components/Header/MobileSearchBar';
import { useCart } from '@/contexts/CartContext';
import ProductSkeleton from '@/components/ProductSkeleton';

import Footer from '@/components/Footer';
import { useIndexPageOptimized } from '@/hooks/useIndexPageOptimized';
import SectionRenderer from '@/components/HomePage/SectionRenderer';
import SpecialSectionRenderer from '@/components/SpecialSections/SpecialSectionRenderer';
import LoadingState from '@/components/HomePage/LoadingState';
import ErrorState from '@/components/HomePage/ErrorState';
import { FloatingActionButton } from '@/components/Retention/FloatingActionButton';
import { HomepageProductPreloader } from '@/components/HomePage/HomepageProductPreloader';
import { useScrollCoins } from '@/hooks/useScrollCoins';
import { ScrollCoinsNotification } from '@/components/Mobile/ScrollCoinsNotification';
import { useSmartScrollRestoration } from '@/hooks/useSmartScrollRestoration';

// Lazy load AdminPanel para reduzir bundle inicial
const AdminPanel = lazy(() => import('./Admin'));

const Index = React.memo(() => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { items, addToCart, updateQuantity, getCartTotal, getCartItemsCount, sendToWhatsApp } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const {
    products,
    productsLoading,
    layoutItems,
    sections,
    specialSections,
    bannerData,
    isLoading,
    sectionsLoading,
    specialSectionsLoading,
    handleRetryProducts
  } = useIndexPageOptimized();

  // Ativar sistema de scroll coins
  const { notification, hideNotification } = useScrollCoins();

  // Ativar sistema de scroll restoration inteligente
  useSmartScrollRestoration();

  const handleAddToCart = useCallback((product: any, size?: string, color?: string) => {
    addToCart(product, size, color);
  }, [addToCart]);

  const findSpecialSection = useCallback((key: string) => {
    if (!key.startsWith('special_section_')) return null;
    const id = key.replace('special_section_', '');
    return specialSections.find(s => s.id === id);
  }, [specialSections]);

  const handleProductCardClick = useCallback(async (productId: string) => {
    // Salvar posição atual antes de navegar
    const currentScrollY = window.scrollY;
    
    // Encontrar o produto clicado para verificar se é SKU
    const clickedProduct = products.find(p => p.id === productId);
    
    if (clickedProduct) {
      // Se é um produto SKU, navegar para a página de produto SKU
      if (clickedProduct.product_type === 'sku' || clickedProduct.parent_product_id) {
        navigate(`/produto/${productId}`);
      }
      // Se é um produto mestre, navegar para o primeiro SKU disponível ou para a página do mestre
      else if (clickedProduct.product_type === 'master' || clickedProduct.is_master_product) {
        navigate(`/produto/${productId}`);
      }
      // Produto simples (padrão)
      else {
        navigate(`/produto/${productId}`);
      }
    } else {
      // Fallback para produtos não encontrados
      navigate(`/produto/${productId}`);
    }
  }, [navigate, products]);

  const handleCartOpen = useCallback(() => setShowCart(true), []);
  const handleAuthOpen = useCallback(() => setShowAuthModal(true), []);
  const handleAuthClose = useCallback(() => setShowAuthModal(false), []);
  
  const toggleMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
  }, [isMobileSearchOpen]);

  // Memoizar filtro de layout items visíveis
  const visibleLayoutItems = useMemo(() => 
    layoutItems.filter(item => item.is_visible), 
    [layoutItems]
  );

  // Função para verificar se uma seção especial tem fundo desabilitado
  const isSpecialSectionWithoutBackground = useCallback((sectionKey: string) => {
    if (!sectionKey.startsWith('special_section_')) return false;
    const specialSectionData = findSpecialSection(sectionKey);
    if (!specialSectionData) return false;
    
    const config = specialSectionData.content_config as any;
    const layoutSettings = config?.layout_settings || { show_background: true };
    
    return !layoutSettings.show_background;
  }, [findSpecialSection]);

  // Função para determinar se deve aplicar espaçamento reduzido
  const shouldReduceSpacing = useCallback((currentIndex: number, items: typeof visibleLayoutItems) => {
    if (currentIndex === 0) return false; // Primeira seção nunca reduz espaçamento superior
    
    const currentItem = items[currentIndex];
    const previousItem = items[currentIndex - 1];
    
    if (!currentItem || !previousItem) return false;
    
    const currentIsSpecialWithoutBg = isSpecialSectionWithoutBackground(currentItem.section_key);
    const previousIsSpecialWithoutBg = isSpecialSectionWithoutBackground(previousItem.section_key);
    
    // Aplicar espaçamento reduzido quando:
    // 1. Seção atual é normal E anterior é seção especial sem fundo
    // 2. Seção atual é seção especial sem fundo E anterior é seção especial sem fundo
    // 3. Seção atual é seção especial sem fundo E anterior é seção normal
    
    if (!currentIsSpecialWithoutBg && previousIsSpecialWithoutBg) {
      // Seção normal após seção especial sem fundo
      return true;
    }
    
    if (currentIsSpecialWithoutBg && previousIsSpecialWithoutBg) {
      // Seção especial sem fundo após outra seção especial sem fundo
      return true;
    }
    
    if (currentIsSpecialWithoutBg && !previousIsSpecialWithoutBg) {
      // Seção especial sem fundo após seção normal
      return true;
    }
    
    return false;
  }, [isSpecialSectionWithoutBackground]);

  return (
    <HomepageProductPreloader products={products}>
      <div className="min-h-screen bg-background w-full overflow-x-hidden flex flex-col">
      <ProfessionalHeader
        onCartOpen={handleCartOpen}
        onAuthOpen={handleAuthOpen}
      />

      <main className="flex-grow">
        {isLoading ? (
          <LoadingState />
        ) : (
          visibleLayoutItems
            .map((item, index) => {
              const sectionKey = item.section_key;
              const reduceSpacing = shouldReduceSpacing(index, visibleLayoutItems);

              if (sectionKey.startsWith('special_section_')) {
                const specialSectionData = findSpecialSection(sectionKey);
                if (specialSectionData && !specialSectionsLoading) {
                  return (
                    <SpecialSectionRenderer 
                      key={sectionKey} 
                      section={specialSectionData as any} 
                      onProductCardClick={handleProductCardClick}
                      reduceTopSpacing={reduceSpacing}
                    />
                  );
                } else if (specialSectionsLoading) {
                  return (
                    <div key={sectionKey} className="py-8 bg-background">
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse relative overflow-hidden mb-6">
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
                        </div>
                        <div className="overflow-hidden">
                          <ProductSkeleton count={4} />
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  console.warn(`Special section data not found for key: ${sectionKey}`);
                  return null;
                }
              }
              
              return (
                <SectionRenderer
                  key={sectionKey}
                  sectionKey={sectionKey}
                  bannerData={bannerData}
                  products={products}
                  sections={sections}
                  productsLoading={productsLoading}
                  sectionsLoading={sectionsLoading}
                  onAddToCart={handleAddToCart}
                  reduceTopSpacing={reduceSpacing}
                />
              );
            })
            .filter(Boolean)
        )}
      </main>

      <Footer />

      {/* Floating Action Button */}
      <FloatingActionButton />

      <Cart
        showCart={showCart}
        setShowCart={setShowCart}
      />

      <AuthModal isOpen={showAuthModal} onClose={handleAuthClose} />
      
      <MobileSearchBar isOpen={isMobileSearchOpen} onClose={toggleMobileSearch} />

      {/* Notificação customizada de scroll coins */}
      <ScrollCoinsNotification
        amount={notification.amount}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
    </HomepageProductPreloader>
  );
});

export default Index;
