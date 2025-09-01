import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, ChevronDown, Grid3X3, List, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts, Product } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { smartSearchProducts } from '@/utils/smartSearch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import ProductModal from '@/components/ProductModal';
import { cn } from '@/lib/utils';

// Componente de Card de Produto Melhorado (estilo GameStop)
const EnhancedProductCard = ({ product, onAddToCart, onCardClick }: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onCardClick: (productId: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Simular avaliações (em uma implementação real, viria do banco)
  const rating = 4.2;
  const reviewCount = Math.floor(Math.random() * 5000) + 100;
  
  // Simular preço para membros (desconto de 5%)
  const memberPrice = product.price * 0.95;
  
  // Cores das bordas (rotação entre as cores da GameStop)
  const borderColors = ['border-red-400', 'border-green-400', 'border-blue-400', 'border-purple-400'];
  const borderColor = borderColors[parseInt(product.id) % borderColors.length];

  return (
    <Card
      className={cn(
        "relative flex flex-col bg-white overflow-hidden",
        "border-2 transition-all duration-300 ease-in-out",
        "rounded-lg shadow-sm hover:shadow-lg",
        "cursor-pointer group",
        "h-[420px]", // Proporção mais vertical como GameStop
        borderColor,
        isHovered && "scale-[1.02] shadow-xl"
      )}
      onClick={() => onCardClick(product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge de Promoção */}
      {product.badge_visible && (
        <div className="absolute top-2 left-2 z-10">
          <Badge 
            className="bg-red-600 text-white text-xs font-bold px-2 py-1"
            style={{ backgroundColor: product.badge_color }}
          >
            {product.badge_text}
          </Badge>
        </div>
      )}

      {/* Imagem do Produto */}
      <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Informações do Produto */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Título */}
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>

          {/* Avaliações */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(rating) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({reviewCount})</span>
          </div>

          {/* Preços */}
          <div className="space-y-1">
            <div className="text-lg font-bold text-gray-900">
              R$ {product.price.toFixed(2)}
            </div>
            <div className="text-sm text-purple-600 font-medium">
              R$ {memberPrice.toFixed(2)} para Membros
            </div>
          </div>

          {/* Badge de Promoção */}
          <div className="text-xs text-green-600 font-medium">
            ⚡ Frete Grátis acima de R$ 150
          </div>
        </div>

        {/* Botão de Adicionar ao Carrinho */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white text-sm"
          size="sm"
        >
          Adicionar ao Carrinho
        </Button>
      </div>
    </Card>
  );
};

// Componente de Card Compacto para "Você também pode gostar"
const CompactProductCard = ({ product, onAddToCart, onCardClick }: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onCardClick: (productId: string) => void;
}) => {
  const memberPrice = product.price * 0.95;

  return (
    <Card
      className="relative flex flex-col bg-white overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group h-[320px]"
      onClick={() => onCardClick(product.id)}
    >
      {/* Imagem do Produto */}
      <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Informações do Produto */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Título */}
          <h4 className="font-medium text-gray-900 text-xs leading-tight line-clamp-2">
            {product.name}
          </h4>

          {/* Preços */}
          <div className="space-y-1">
            <div className="text-sm font-bold text-gray-900">
              R$ {product.price.toFixed(2)}
            </div>
            <div className="text-xs text-purple-600 font-medium">
              R$ {memberPrice.toFixed(2)} para Membros
            </div>
          </div>
        </div>

        {/* Botão de Adicionar ao Carrinho */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white text-xs"
          size="sm"
        >
          Adicionar ao Carrinho
        </Button>
      </div>
    </Card>
  );
};

const SearchResultsPerfect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  // Estados para filtros e ordenação
  const [sortBy, setSortBy] = useState('best-matches');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for managing the product modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Usar busca inteligente para separar resultados exatos de relacionados
  const { exactMatches, relatedProducts } = smartSearchProducts(products, query);

  // Aplicar ordenação apenas aos resultados exatos
  const sortProducts = (products: Product[], sortBy: string) => {
    switch (sortBy) {
      case 'price-low':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...products].sort((a, b) => b.price - a.price);
      case 'name':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return [...products].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
      default:
        return products;
    }
  };

  const sortedExactMatches = sortProducts(exactMatches, sortBy);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const sortOptions = [
    { value: 'best-matches', label: 'Melhores Resultados' },
    { value: 'price-low', label: 'Menor Preço' },
    { value: 'price-high', label: 'Maior Preço' },
    { value: 'name', label: 'Nome A-Z' },
    { value: 'newest', label: 'Mais Recentes' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">UTI DOS GAMES</h1>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Cabeçalho dos resultados */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {sortedExactMatches.length} Resultado{sortedExactMatches.length !== 1 ? 's' : ''} para "{query}"
          </h2>
          
          {/* Barra de filtros e ordenação */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              <Badge variant="secondary" className="ml-1">0</Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  Ordenar: {sortOptions.find(opt => opt.value === sortBy)?.label}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm">
              Retirada na Loja
            </Button>
            
            <Button variant="outline" size="sm">
              Entrega no Mesmo Dia
            </Button>
          </div>
        </div>

        {/* Resultados principais */}
        {sortedExactMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
            {sortedExactMatches.map((product) => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onCardClick={handleProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              Nenhum resultado encontrado para "{query}"
            </p>
            <p className="text-gray-500">
              Tente usar termos diferentes ou verifique a ortografia.
            </p>
          </div>
        )}

        {/* Seção "Você também pode gostar" */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Você também pode gostar
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedProducts.map((product) => (
                  <CompactProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onCardClick={handleProductClick}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal do produto */}
      {isModalOpen && selectedProductId && (
        <ProductModal
          product={products.find(p => p.id === selectedProductId) || null}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default SearchResultsPerfect;

