import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useProductSections } from '@/hooks/useProductSections';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import SearchResultProductCard from '@/components/SearchResultProductCard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const SectionPage: React.FC = () => {
  const { sectionKey } = useParams<{ sectionKey: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addToCart, updateQuantity, getCartTotal, getCartItemsCount, sendToWhatsApp } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name'>('relevance');

  // Hooks para buscar dados
  const { products, loading: productsLoading } = useProducts();
  const { sections, loading: sectionsLoading } = useProductSections();

  // Encontrar a seção atual
  const currentSection = useMemo(() => {
    if (!sectionKey || !sections) return null;
    
    // Se sectionKey é do formato "product_section_ID", extrair o ID
    if (sectionKey.startsWith('product_section_')) {
      const sectionId = sectionKey.replace('product_section_', '');
      return sections.find(section => section.id === sectionId);
    }
    
    // Caso contrário, buscar por id diretamente
    return sections.find(section => section.id === sectionKey);
  }, [sectionKey, sections]);

  // Filtrar produtos da seção
  const sectionProducts = useMemo(() => {
    if (!currentSection || !products) return [];
    
    // Usar a mesma lógica do SectionRenderer para consistência
    const productMap = new Map<string, any>();
    
    if (currentSection.items) {
      for (const item of currentSection.items) {
        if (item.item_type === 'product') {
          // Encontrar produto específico por ID
          const product = products.find(p => p.id === item.item_id);
          if (product && product.product_type !== 'master' && !productMap.has(product.id)) { // Filter master products
            productMap.set(product.id, product);
          }
        } else if (item.item_type === 'tag') {
          // Encontrar produtos com esta tag, excluindo produtos master
          const tagProducts = products.filter(p => 
            p.product_type !== 'master' && // Filter master products
            p.tags?.some(tag => tag.name.toLowerCase() === item.item_id.toLowerCase() || tag.id === item.item_id)
          );
          tagProducts.forEach(product => {
            if (!productMap.has(product.id)) {
              productMap.set(product.id, product);
            }
          });
        }
      }
    }
    
    return Array.from(productMap.values());
  }, [currentSection, products]);

  // Ordenar produtos
  const sortedProducts = useMemo(() => {
    if (!sectionProducts) return [];
    
    const sorted = [...sectionProducts];
    
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'relevance':
      default:
        return sorted;
    }
  }, [sectionProducts, sortBy]);

  // Handlers
  const handleAddToCart = (product: any, size?: string, color?: string) => {
    addToCart(product, size, color);
  };

  const handleProductCardClick = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  const handleCartToggle = () => {
    setShowCart(!showCart);
  };

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal);
  };

  // Loading state
  if (productsLoading || sectionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader
          user={user}
          cartItemsCount={getCartItemsCount()}
          onCartClick={handleCartToggle}
          onAuthClick={handleAuthModalToggle}
          showNavigation={false}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16 text-muted-foreground">
            Carregando produtos...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Seção não encontrada
  if (!currentSection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfessionalHeader
          user={user}
          cartItemsCount={getCartItemsCount()}
          onCartClick={handleCartToggle}
          onAuthClick={handleAuthModalToggle}
          showNavigation={false}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Seção não encontrada</h1>
            <p className="text-muted-foreground mb-6">A seção que você está procurando não existe.</p>
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

  const sectionTitle = currentSection.title || 'Produtos';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header oficial */}
      <ProfessionalHeader
        user={user}
        cartItemsCount={getCartItemsCount()}
        onCartClick={handleCartToggle}
        onAuthClick={handleAuthModalToggle}
        showNavigation={false}
      />

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Título da seção */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Seção: {sectionTitle}
          </h1>
          <p className="text-gray-600">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        {/* Filtros e ordenação */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="relevance">Melhores Resultados</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="name">Nome A-Z</option>
            </select>
          </div>
        </div>

        {/* Grid de produtos */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h2>
            <p className="text-gray-600 mb-6">Não há produtos disponíveis nesta seção no momento.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Voltar ao Início
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {sortedProducts.map((product) => (
              <SearchResultProductCard
                key={product.id}
                product={product}
                onCardClick={handleProductCardClick}
                onAddToCart={handleAddToCart}
              />
            ))}
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

export default SectionPage;

