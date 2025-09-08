import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrimePages, PrimePageWithLayout } from '@/hooks/usePrimePages';
import { useProducts } from '@/hooks/useProducts';
import { useProductSections } from '@/hooks/useProductSections';
import { useSpecialSections } from '@/hooks/useSpecialSections';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import Footer from '@/components/Footer';
import Cart from '@/components/Cart';
import { AuthModal } from '@/components/Auth/AuthModal';
import PrimePageRenderer from '@/components/PrimePages/PrimePageRenderer';
import LoadingState from '@/components/HomePage/LoadingState';
import ErrorState from '@/components/HomePage/ErrorState';

const PrimePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addToCart, updateQuantity, getCartTotal, getCartItemsCount, sendToWhatsApp } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<PrimePageWithLayout | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Hooks para dados
  const { fetchPageBySlug } = usePrimePages();
  const { products, loading: productsLoading } = useProducts();
  const { sections, loading: sectionsLoading } = useProductSections();
  const { sections: specialSections, loading: specialSectionsLoading } = useSpecialSections();

  // Buscar página por slug
  useEffect(() => {
    const loadPage = async () => {
      if (!slug) {
        setPageError('Slug da página não fornecido');
        setPageLoading(false);
        return;
      }

      setPageLoading(true);
      setPageError(null);

      try {
        const page = await fetchPageBySlug(slug);
        if (page) {
          setCurrentPage(page);
        } else {
          setPageError('Página não encontrada');
        }
      } catch (error) {
        console.error('Error loading page:', error);
        setPageError('Erro ao carregar a página');
      } finally {
        setPageLoading(false);
      }
    };

    loadPage();
  }, [slug, fetchPageBySlug]);

  // Handlers
  const handleAddToCart = (product: any, size?: string, color?: string) => {
    addToCart(product, size, color);
  };

  const handleCartToggle = () => {
    console.log('[PrimePage] handleCartToggle called');
    setShowCart(prev => {
      console.log('[PrimePage] Setting showCart to:', !prev);
      return !prev;
    });
  };

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal);
  };

  // Loading state
  const isLoading = pageLoading || productsLoading || sectionsLoading || specialSectionsLoading;

  // Error state
  if (pageError && !pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader
          user={user}
          cartItemsCount={getCartItemsCount()}
          onCartOpen={handleCartToggle}
          onAuthOpen={handleAuthModalToggle}
        />
        <div className="container mx-auto px-4 py-8">
          <ErrorState 
            title="Página não encontrada"
            message={pageError}
            onRetry={() => window.location.reload()}
            showRetry={false}
          />
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader
          user={user}
          cartItemsCount={getCartItemsCount()}
          onCartOpen={handleCartToggle}
          onAuthOpen={handleAuthModalToggle}
        />
        <LoadingState />
        <Footer />
      </div>
    );
  }

  // Página não encontrada
  if (!currentPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader
          user={user}
          cartItemsCount={getCartItemsCount()}
          onCartOpen={handleCartToggle}
          onAuthOpen={handleAuthModalToggle}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Página não encontrada</h1>
            <p className="text-gray-600 mb-6">A página que você está procurando não existe ou foi removida.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ProfessionalHeader
        user={user}
        cartItemsCount={getCartItemsCount()}
        onCartOpen={handleCartToggle}
        onAuthOpen={handleAuthModalToggle}
      />

      {/* Conteúdo principal */}
      <main className="min-h-screen">
        {currentPage.layout_items && currentPage.layout_items.length > 0 ? (
          currentPage.layout_items.map((layoutItem, index) => (
            <PrimePageRenderer
              key={`${layoutItem.section_key}-${index}`}
              layoutItem={layoutItem}
              products={products}
              sections={sections}
              specialSections={specialSections}
              productsLoading={productsLoading}
              sectionsLoading={sectionsLoading}
              onAddToCart={handleAddToCart}
              reduceTopSpacing={index > 0}
            />
          ))
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentPage.title}</h1>
            {currentPage.description && (
              <p className="text-gray-600 mb-8">{currentPage.description}</p>
            )}
            <p className="text-gray-500">Esta página ainda não possui conteúdo configurado.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modais */}
      {showCart && (
        <Cart
          items={items}
          onUpdateQuantity={updateQuantity}
          onClose={handleCartToggle}
          onSendToWhatsApp={sendToWhatsApp}
          total={getCartTotal()}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleAuthModalToggle}
        />
      )}
    </div>
  );
};

export default PrimePage;

