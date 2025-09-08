import React, { useState, useMemo, useCallback } from 'react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [promotionFilter, setPromotionFilter] = useState('all');

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

  // Aplicar filtros de preço, disponibilidade e promoções
  const filteredProducts = useMemo(() => {
    let filtered = [...sectionProducts];
    
    // Filtro de preço
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = product.price;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }
    
    // Filtro de disponibilidade
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (availabilityFilter === 'in_stock') {
          return product.stock > 0;
        } else if (availabilityFilter === 'out_of_stock') {
          return product.stock === 0;
        }
        return true;
      });
    }
    
    // Filtro de promoções
    if (promotionFilter !== 'all') {
      filtered = filtered.filter(product => {
        if (promotionFilter === 'on_sale') {
          return product.list_price && product.list_price > product.price;
        } else if (promotionFilter === 'featured') {
          return product.is_featured;
        } else if (promotionFilter === 'new') {
          // Considerar produtos criados nos últimos 30 dias como novos
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(product.created_at || '') > thirtyDaysAgo;
        }
        return true;
      });
    }
    
    return filtered;
  }, [sectionProducts, priceRange, availabilityFilter, promotionFilter]);

  // Ordenar produtos
  const sortedProducts = useMemo(() => {
    if (!filteredProducts) return [];
    
    const sorted = [...filteredProducts];
    
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
  }, [filteredProducts, sortBy]);

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
          onCartOpen={handleCartToggle}
          onAuthOpen={handleAuthModalToggle}
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
          onCartOpen={handleCartToggle}
          onAuthOpen={handleAuthModalToggle}
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
        {/* Botão de voltar */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Voltar para Home</span>
          </button>
        </div>

        {/* Título da seção */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Seção: {sectionTitle}
          </h1>
          <p className="text-gray-600">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        {/* Filtros e ordenação profissionais */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="relevance">Melhores Resultados</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              Filtros
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Filtro de Preço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa de Preço
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-gray-500 self-center">até</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              {/* Filtro de Disponibilidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilidade
                </label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">Todos</option>
                  <option value="in_stock">Em Estoque</option>
                  <option value="out_of_stock">Fora de Estoque</option>
                </select>
              </div>
              
              {/* Filtro de Promoções */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promoções
                </label>
                <select
                  value={promotionFilter}
                  onChange={(e) => setPromotionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">Todos</option>
                  <option value="on_sale">Em Promoção</option>
                  <option value="featured">Produtos em Destaque</option>
                  <option value="new">Novos Produtos</option>
                </select>
              </div>
              
              {/* Botões de Ação */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    // Aplicar filtros (já aplicados automaticamente via useMemo)
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Aplicar Filtros
                </button>
                <button
                  onClick={() => {
                    setPriceRange({ min: '', max: '' });
                    setAvailabilityFilter('all');
                    setPromotionFilter('all');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Limpar Tudo
                </button>
              </div>
            </div>
          )}
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">{sortedProducts.map((product) => (
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

