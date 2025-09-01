import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, ChevronDown, Grid3X3, List, Star, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProducts, Product } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import { smartSearchProducts } from '@/utils/smartSearch';
import { getAdvancedSpellCorrection, autoCorrectAdvanced } from '@/utils/advancedSpellCorrector';
import SearchResultProductCard from '@/components/SearchResultProductCard';
import Header from '@/components/Header';
import Cart from '@/components/Cart';
import { AuthModal } from '@/components/Auth/AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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

// Componente "Você quis dizer"
const SpellingSuggestion = ({ originalQuery, suggestion, onAcceptSuggestion }: {
  originalQuery: string;
  suggestion: string;
  onAcceptSuggestion: (newQuery: string) => void;
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 text-blue-800">
        <Search className="w-4 h-4" />
        <span className="text-sm">
          Você quis dizer{' '}
          <button
            onClick={() => onAcceptSuggestion(suggestion)}
            className="font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            "{suggestion}"
          </button>
          ?
        </span>
      </div>
      <div className="text-xs text-blue-600 mt-1">
        Mostrando resultados para "{originalQuery}"
      </div>
    </div>
  );
};

const SearchResultsFinal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const originalQuery = searchParams.get('q') || '';
  const { products, loading } = useProducts();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  // Estados para filtros e ordenação
  const [sortBy, setSortBy] = useState('best-matches');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para modais de carrinho e auth
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Estado para query atual (pode ser diferente da original se houver correção)
  const [currentQuery, setCurrentQuery] = useState(originalQuery);
  const [showSpellingSuggestion, setShowSpellingSuggestion] = useState(false);
  const [spellingSuggestion, setSpellingSuggestion] = useState<string | null>(null);
  const [suggestionConfidence, setSuggestionConfidence] = useState(0);
  const [correctionType, setCorrectionType] = useState<string>('none');
  const [isAutoCorrected, setIsAutoCorrected] = useState(false);
  const [originalQueryForDisplay, setOriginalQueryForDisplay] = useState<string | null>(null);
  const [correctionProcessed, setCorrectionProcessed] = useState(false);

  // Atualizar currentQuery quando a URL mudar (nova busca pelo header)
  useEffect(() => {
    const newQuery = searchParams.get('q') || '';
    if (newQuery !== currentQuery) {
      setCurrentQuery(newQuery);
      setShowSpellingSuggestion(false);
      setSpellingSuggestion(null);
      setIsAutoCorrected(false);
      setOriginalQueryForDisplay(null);
      setCorrectionProcessed(false); // Reset para permitir nova correção
    }
  }, [searchParams, currentQuery]);

  // Verificar correção ortográfica avançada quando produtos carregarem ou query mudar
  useEffect(() => {
    if (products.length > 0 && currentQuery && !correctionProcessed) {
      // Sistema avançado de correção ortográfica
      const spellCheck = getAdvancedSpellCorrection(currentQuery, products);
      
      if (spellCheck.needsCorrection && spellCheck.suggestion) {
        // Auto-correção para casos com alta confiança
        const shouldAutoCorrect = spellCheck.confidence >= 0.8;
        
        if (shouldAutoCorrect && !isAutoCorrected) {
          // Fazer correção automática
          setOriginalQueryForDisplay(currentQuery);
          setCurrentQuery(spellCheck.suggestion);
          setIsAutoCorrected(true);
          setShowSpellingSuggestion(false);
          setCorrectionProcessed(true); // Marcar como processado para evitar loops
          
          // Atualizar URL sem recarregar página
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set('q', spellCheck.suggestion);
          setSearchParams(newSearchParams);
        } else if (!isAutoCorrected) {
          // Mostrar sugestão manual
          setSpellingSuggestion(spellCheck.suggestion);
          setSuggestionConfidence(spellCheck.confidence);
          setCorrectionType(spellCheck.correctionType);
          setShowSpellingSuggestion(true);
          setCorrectionProcessed(true); // Marcar como processado
        }
      } else {
        setShowSpellingSuggestion(false);
        setSpellingSuggestion(null);
        setSuggestionConfidence(0);
        setCorrectionType('none');
        setCorrectionProcessed(true); // Marcar como processado mesmo sem correção
      }
    }
  }, [products, currentQuery, correctionProcessed, isAutoCorrected, searchParams, setSearchParams]);

  // Usar busca inteligente para separar resultados exatos de relacionados
  const { exactMatches, relatedProducts } = smartSearchProducts(products, currentQuery);

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
    navigate(`/produto/${productId}`);
  };

  const handleCartOpen = () => {
    setShowCart(true);
  };

  const handleAuthOpen = () => {
    setShowAuthModal(true);
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
  };

  const handleAcceptSuggestion = (newQuery: string) => {
    setCurrentQuery(newQuery);
    setShowSpellingSuggestion(false);
    
    // Atualizar URL com a nova query
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('q', newQuery);
    setSearchParams(newSearchParams);
  };

  const handleShowOriginalResults = () => {
    if (originalQueryForDisplay) {
      setCurrentQuery(originalQueryForDisplay);
      setIsAutoCorrected(false);
      setOriginalQueryForDisplay(null);
      setCorrectionProcessed(true); // Evitar nova correção automática
      
      // Atualizar URL de volta para query original
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('q', originalQueryForDisplay);
      setSearchParams(newSearchParams);
    }
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header oficial do site */}
      <Header 
        onCartOpen={handleCartOpen}
        onAuthOpen={handleAuthOpen}
      />

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 pt-[180px] pb-6">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Home
          </Button>
        </div>

        {/* Mensagem de correção automática */}
        {isAutoCorrected && originalQueryForDisplay && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                <span className="text-green-800">
                  Exibindo resultados para 
                  <span className="ml-1 font-semibold text-green-900">"{currentQuery}"</span>
                </span>
              </div>
              <button
                onClick={handleShowOriginalResults}
                className="text-sm text-green-600 hover:text-green-800 underline"
              >
                Mostrar resultados para "{originalQueryForDisplay}"
              </button>
            </div>
          </div>
        )}

        {/* Sugestão de correção ortográfica (para casos não auto-corrigidos) */}
        {showSpellingSuggestion && spellingSuggestion && !isAutoCorrected && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">
                  {correctionType === 'extra_letter' ? 'Você digitou uma letra a mais?' : 'Você quis dizer:'} 
                  <button
                    onClick={() => handleAcceptSuggestion(spellingSuggestion)}
                    className="ml-2 font-semibold text-blue-600 hover:text-blue-800 underline"
                  >
                    "{spellingSuggestion}"
                  </button>
                  ?
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <span>Confiança: {Math.round(suggestionConfidence * 100)}%</span>
                <span className="px-2 py-1 bg-blue-100 rounded text-blue-700">
                  {correctionType === 'exact' ? 'Correspondência Exata' :
                   correctionType === 'transposition' ? 'Transposição' :
                   correctionType === 'pattern' ? 'Padrão Comum' :
                   correctionType === 'phonetic' ? 'Fonético' : 
                   correctionType === 'ngram' ? 'N-grama' :
                   correctionType === 'edit_distance' ? 'Distância de Edição' : 'Avançado'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cabeçalho dos resultados */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {sortedExactMatches.length} Resultado{sortedExactMatches.length !== 1 ? 's' : ''} para "{currentQuery}"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-12">
            {sortedExactMatches.map((product) => (
              <div key={product.id} className="w-full">
                <SearchResultProductCard
                  product={product}
                  onCardClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600 text-lg mb-4">
                Não encontramos produtos para "{currentQuery}"
              </p>
              <div className="text-gray-500 space-y-1">
                <p>• Verifique a ortografia das palavras</p>
                <p>• Tente usar termos mais gerais</p>
                <p>• Use palavras-chave diferentes</p>
              </div>
            </div>
          </div>
        )}

        {/* Seção "Você também pode gostar" */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Você também pode gostar
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {relatedProducts.map((product) => (
                  <div key={product.id} className="w-full">
                    <SearchResultProductCard
                      product={product}
                      onCardClick={handleProductClick}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal do carrinho */}
      <Cart
        showCart={showCart}
        setShowCart={setShowCart}
      />

      {/* Modal de autenticação */}
      <AuthModal isOpen={showAuthModal} onClose={handleAuthClose} />
    </div>
  );
};

export default SearchResultsFinal;

