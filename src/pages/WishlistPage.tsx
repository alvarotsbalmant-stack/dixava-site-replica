
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/contexts/CartContext';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const WishlistPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { favorites, isLoading, removeFromFavorites, isRemovingFromFavorites } = useFavorites();
  const { items, addToCart, updateQuantity, getCartTotal, getCartItemsCount, sendToWhatsApp } = useCart();
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Redirecionar se não estiver logado
  React.useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleRemoveFromFavorites = async (productId: string) => {
    await removeFromFavorites(productId);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/produto/${productId}`);
  };

  const handleCartToggle = () => {
    setShowCart(!showCart);
  };

  const handleAuthModalToggle = () => {
    setShowAuthModal(!showAuthModal);
  };

  if (isLoading) {
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
            Carregando sua lista de desejos...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Heart className="h-7 w-7 md:h-8 md:w-8 text-red-500" />
            Minha Lista de Desejos
          </h1>
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'produto' : 'produtos'} na sua lista
          </p>
        </div>

        {/* Grid de produtos ou estado vazio */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Sua lista de desejos está vazia
            </h2>
            <p className="text-gray-600 mb-6">
              Adicione produtos aos seus favoritos para vê-los aqui
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Explorar Produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {favorites.map((favorite) => {
              const product = favorite.product;
              if (!product) return null;

              return (
                <WishlistProductCard
                  key={favorite.id}
                  product={product}
                  onCardClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  onRemoveFromWishlist={handleRemoveFromFavorites}
                  isRemoving={isRemovingFromFavorites}
                />
              );
            })}
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

// Card adaptado para wishlist
interface WishlistProductCardProps {
  product: any;
  onCardClick: (productId: string) => void;
  onAddToCart: (product: any) => void;
  onRemoveFromWishlist: (productId: string) => void;
  isRemoving: boolean;
}

const WishlistProductCard = React.memo(({ 
  product, 
  onCardClick, 
  onAddToCart, 
  onRemoveFromWishlist,
  isRemoving 
}: WishlistProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-action="true"]')) {
      return;
    }
    onCardClick(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleRemoveFromWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemoveFromWishlist(product.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Card
      className={cn(
        "relative flex flex-col bg-white overflow-hidden",
        "border border-gray-200",
        "rounded-lg",
        "shadow-none",
        "transition-all duration-200 ease-in-out",
        "cursor-pointer",
        "w-full h-[280px] sm:h-[300px] md:h-[340px] lg:h-[360px]",
        "p-0",
        "product-card",
        isHovered && "md:shadow-md md:-translate-y-1"
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Botão de remover da wishlist */}
      <button
        onClick={handleRemoveFromWishlist}
        disabled={isRemoving}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 disabled:opacity-50"
        data-action="true"
      >
        <Trash2 className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
      </button>

      {/* Imagem do produto */}
      <div className="relative overflow-hidden bg-gray-100 flex-1">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=300&fit=crop'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Informações do produto */}
      <div className="flex flex-1 flex-col justify-between p-1.5 sm:p-2 md:p-2.5 lg:p-3 min-h-0">
        {/* Nome do produto */}
        <div className="mb-2">
          <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>

        {/* Preço e botão */}
        <div className="space-y-2">
          {/* Preços */}
          <div className="space-y-1">
            {product.promotional_price ? (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm md:text-base font-bold text-red-600">
                  {formatPrice(product.promotional_price)}
                </span>
              </div>
            ) : product.uti_pro_price ? (
              <div className="flex flex-col">
                <span className="text-xs md:text-sm font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-blue-600 font-medium">
                  UTI PRO: {formatPrice(product.uti_pro_price)}
                </span>
              </div>
            ) : (
              <span className="text-sm md:text-base font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Botão adicionar ao carrinho */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-medium py-1.5 md:py-2 px-2 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
            data-action="true"
          >
            <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </div>
    </Card>
  );
});

export default WishlistPage;
