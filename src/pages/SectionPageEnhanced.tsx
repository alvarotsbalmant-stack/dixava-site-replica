import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useProductSections } from '@/hooks/useProductSections';
import { useSpecialSections } from '@/hooks/useSpecialSections';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import SearchResultProductCard from '@/components/SearchResultProductCard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Filter } from 'lucide-react';

const SectionPageEnhanced: React.FC = () => {
  const { sectionKey } = useParams<{ sectionKey: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, addToCart, updateQuantity, getCartTotal, getCartItemsCount, sendToWhatsApp } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'name'>('relevance');
  const [viewMode, setViewMode] = useState<'grid'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Hooks para buscar dados
  const { products, loading: productsLoading } = useProducts();
  const { sections, loading: sectionsLoading } = useProductSections();
  const { specialSections, loading: specialSectionsLoading } = useSpecialSections();

  // Encontrar a seção atual (normal ou especial)
  const { currentSection, isSpecialSection } = useMemo(() => {
    if (!sectionKey) return { currentSection: null, isSpecialSection: false };
    
    // Verificar se é seção especial
    if (sectionKey.startsWith('special_section_')) {
      const sectionId = sectionKey.replace('special_section_', '');
      const specialSection = specialSections?.find(section => section.id === sectionId);
      return { currentSection: specialSection, isSpecialSection: true };
    }
    
    // Verificar se é seção de produto normal
    if (sectionKey.startsWith('product_section_')) {
      const sectionId = sectionKey.replace('product_section_', '');
      const productSection = sections?.find(section => section.id === sectionId);
      return { currentSection: productSection, isSpecialSection: false };
    }
    
    // Buscar por ID diretamente (compatibilidade)
    const productSection = sections?.find(section => section.id === sectionKey);
    if (productSection) {
      return { currentSection: productSection, isSpecialSection: false };
    }
    
    const specialSection = specialSections?.find(section => section.id === sectionKey);
    if (specialSection) {
      return { currentSection: specialSection, isSpecialSection: true };
    }
    
    return { currentSection: null, isSpecialSection: false };
  }, [sectionKey, sections, specialSections]);

  // Filtrar produtos da seção (normal ou especial)
  const sectionProducts = useMemo(() => {
    if (!currentSection || !products) return [];
    
    if (isSpecialSection) {
      // Lógica para seções especiais
      const specialSection = currentSection as any;
      const config = specialSection.content_config as any;
      
      if (!config) return [];
      
      const productIds: string[] = [];
      
      // Extrair IDs de produtos dos carrosséis
      if (config.carousel_rows && Array.isArray(config.carousel_rows)) {
        config.carousel_rows.forEach((row: any) => {
          if (row.product_ids && Array.isArray(row.product_ids)) {
            productIds.push(...row.product_ids);
          }
        });
      }
      
      // Compatibilidade com formato legado
      if (config.carousel1?.product_ids) {
        productIds.push(...config.carousel1.product_ids);
      }
      if (config.carousel2?.product_ids) {
        productIds.push(...config.carousel2.product_ids);
      }
      if (config.carousel3?.product_ids) {
        productIds.push(...config.carousel3.product_ids);
      }
      
      // Filtrar produtos únicos
      const uniqueIds = [...new Set(productIds)];
      return products.filter(product => uniqueIds.includes(product.id));
    } else {
      // Lógica para seções de produtos normais
      const productSection = currentSection as any;
      const productMap = new Map<string, any>();
      
      if (productSection.items) {
        for (const item of productSection.items) {
          if (item.item_type === 'product') {
            const product = products.find(p => p.id === item.item_id);
            if (product) {
              productMap.set(product.id, product);
            }
          } else if (item.item_type === 'tag') {
            // Buscar produtos por tag
            const tagName = item.item_id.toLowerCase();
            const tagProducts = products.filter(product => {
              // Verificar se o produto tem a tag no nome, categoria ou outras propriedades
              const productName = product.name.toLowerCase();
              const productCategory = product.category?.toLowerCase() || '';
              const productBrand = product.brand?.toLowerCase() || '';
              
              return productName.includes(tagName) || 
                     productCategory.includes(tagName) || 
                     productBrand.includes(tagName) ||
                     (product.slug && product.slug.toLowerCase().includes(tagName));
            });
            
            tagProducts.forEach(product => {
              productMap.set(product.id, product);
            });
          }
        }
      }
      
      return Array.from(productMap.values());
    }
  }, [currentSection, products, isSpecialSection]);

  // Aplicar filtros de preço
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
    
    return filtered;
  }, [sectionProducts, priceRange]);

  // Ordenar produtos
  const sortedProducts = useMemo(() => {
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
  const handleProductCardClick = useCallback((productId: string) => {
    const product = products?.find(p => p.id === productId);
    if (product) {
      navigate(`/produto/${product.slug}`);
    }
  }, [products, navigate]);

  const handleAddToCart = useCallback((product: any) => {
    addToCart(product, 1);
  }, [addToCart]);

  const handleCartToggle = () => {
    setShowCart(!showCart);
  };

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal);
  };

  const handlePriceFilter = () => {
    // Filtros já são aplicados automaticamente via useMemo
    setShowFilters(false);
  };

  const clearPriceFilter = () => {
    setPriceRange({ min: '', max: '' });
  };

  // Loading state
  if (productsLoading || sectionsLoading || specialSectionsLoading) {
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
            <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
              Voltar ao Início
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const sectionTitle = currentSection?.title || 'Produtos';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header oficial */}
      <ProfessionalHeader
        user={user}
        cartItemsCount={getCartItemsCount()}
        onCartOpen={handleCartToggle}
        onAuthOpen={handleAuthModalToggle}
        showNavigation={false}
      />

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumb e botão voltar */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Home
          </Button>
        </div>

        {/* Título da seção */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {sectionTitle}
          </h1>
          <p className="text-gray-600">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        {/* Barra de filtros e controles */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Controles de ordenação e visualização */}
            <div className="flex flex-wrap items-center gap-4">
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

              {/* Removido: botões de visualização - mantendo apenas grid */}
            </div>

            {/* Botão de filtros */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {(priceRange.min || priceRange.max) && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">1</span>
              )}
            </Button>
          </div>

          {/* Painel de filtros */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filtro de Preço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faixa de Preço
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Mín"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="text-sm"
                    />
                    <span className="text-gray-500">até</span>
                    <Input
                      type="number"
                      placeholder="Máx"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Filtro de Disponibilidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidade
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">Todos</option>
                    <option value="in_stock">Em Estoque</option>
                    <option value="out_of_stock">Fora de Estoque</option>
                  </select>
                </div>

                {/* Filtro de Promoção */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promoções
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">Todos</option>
                    <option value="on_sale">Em Promoção</option>
                    <option value="featured">Produtos em Destaque</option>
                    <option value="new">Novos Produtos</option>
                  </select>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-end gap-2">
                  <Button onClick={handlePriceFilter} size="sm" className="bg-red-600 hover:bg-red-700">
                    Aplicar Filtros
                  </Button>
                  <Button onClick={clearPriceFilter} variant="outline" size="sm">
                    Limpar Tudo
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid de produtos */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h2>
            <p className="text-gray-600 mb-6">
              {priceRange.min || priceRange.max 
                ? 'Nenhum produto encontrado na faixa de preço selecionada.'
                : 'Não há produtos disponíveis nesta seção no momento.'
              }
            </p>
            {(priceRange.min || priceRange.max) && (
              <Button onClick={clearPriceFilter} variant="outline" className="mr-4">
                Limpar Filtros
              </Button>
            )}
            <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700">
              Voltar ao Início
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

export default SectionPageEnhanced;

