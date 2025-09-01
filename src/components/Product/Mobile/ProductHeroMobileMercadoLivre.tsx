import React, { useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { SKUNavigation } from '@/hooks/useProducts/types';
import { Star, Heart, Share2, ChevronLeft, ChevronRight, Truck, Shield, Clock, Check, Info, ShoppingCart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FavoriteButton from '@/components/FavoriteButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useUTICoins } from '@/contexts/UTICoinsContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import useDynamicPlatforms from '@/hooks/useDynamicPlatforms';

interface ProductHeroMobileMercadoLivreProps {
  product: Product;
  skuNavigation?: SKUNavigation;
  onAddToCart: (product: Product) => void;
}

const ProductHeroMobileMercadoLivre: React.FC<ProductHeroMobileMercadoLivreProps> = ({ 
  product, 
  skuNavigation,
  onAddToCart 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { earnCoins } = useUTICoins();
  const { trackEvent } = useAnalytics();
  const { platformConfig } = useDynamicPlatforms();

  // Combinar imagem principal com imagens adicionais
  const allImages = [product.image, ...(product.additional_images || [])].filter(Boolean);

  // Calcular desconto
  const discountPercentage = product.list_price && product.list_price > product.price 
    ? Math.round(((product.list_price - product.price) / product.list_price) * 100)
    : 0;

  // Preço parcelado
  const installmentPrice = product.price / 12;
  const pixPrice = product.price * 0.95; // 5% desconto no PIX

  useEffect(() => {
    // Track product view
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price
    });
  }, [product.id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product);
      trackEvent('add_to_cart', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: quantity
      });
      
      // Ganhar moedas UTI por adicionar ao carrinho
      if (user) {
        await earnCoins('add_to_cart', 10, `Adicionou ${product.name} ao carrinho`);
      }
      
      onAddToCart(product);
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Redirecionar para checkout ou WhatsApp
    const message = `Olá! Gostaria de comprar:\n\n${product.name}\nPreço: R$ ${product.price.toFixed(2).replace('.', ',')}\nQuantidade: ${quantity}`;
    const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white">
      {/* Header com breadcrumb e social proof */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Avaliação (simulada por enquanto) */}
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.8</span>
              <span className="text-sm text-gray-500">(127)</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <FavoriteButton productId={product.id} size="sm" />
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          {product.is_featured && (
            <Badge className="bg-orange-500 text-white text-xs">
              MAIS VENDIDO
            </Badge>
          )}
          {product.badge_visible && product.badge_text && (
            <Badge 
              className="text-white text-xs"
              style={{ backgroundColor: product.badge_color || '#DC2626' }}
            >
              {product.badge_text}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            1º em {product.category}
          </Badge>
        </div>
      </div>

      {/* Galeria de Imagens */}
      <div className="relative">
        <div className="aspect-square bg-gray-50 relative overflow-hidden">
          <img
            src={allImages[selectedImageIndex]}
            alt={product.name}
            className="w-full h-full object-contain"
          />
          
          {/* Navegação de imagens */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicadores */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedImageIndex ? 'bg-blue-500' : 'bg-white bg-opacity-60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Contador de imagens */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
            {selectedImageIndex + 1}/{allImages.length}
          </div>
        </div>
      </div>

      {/* Título do Produto */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-medium text-gray-900 leading-tight">
          {product.name}
        </h1>
      </div>

      {/* Preços */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          {/* Preço anterior e desconto */}
          {product.list_price && product.list_price > product.price && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 line-through">
                R$ {product.list_price.toFixed(2).replace('.', ',')}
              </span>
              <Badge className="bg-green-500 text-white text-xs">
                {discountPercentage}% OFF
              </Badge>
            </div>
          )}
          
          {/* Preço principal */}
          <div className="text-3xl font-light text-gray-900">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </div>
          
          {/* Parcelamento */}
          <div className="text-sm text-gray-600">
            12x R$ {installmentPrice.toFixed(2).replace('.', ',')} sem juros
          </div>
          
          {/* PIX */}
          <div className="text-sm">
            <span className="text-gray-600">ou </span>
            <span className="text-green-600 font-medium">
              R$ {pixPrice.toFixed(2).replace('.', ',')} no PIX
            </span>
          </div>
        </div>
      </div>

      {/* Informações de Entrega */}
      <div className="px-4 pb-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700">
            <Truck className="w-4 h-4" />
            <span className="text-sm font-medium">Chegará grátis</span>
          </div>
          <div className="text-sm text-green-600 mt-1">
            entre 25 e 28/ago
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Chegará entre 18 e 21/ago
        </div>
        
        <button className="text-blue-600 text-sm font-medium mt-1">
          Mais formas de entrega
        </button>
      </div>

      {/* Vendedor */}
      <div className="px-4 pb-4">
        <div className="text-sm text-gray-600">
          Vendido por <span className="text-blue-600 font-medium">UTI DOS GAMES</span>
        </div>
        <div className="text-sm text-gray-500">
          +1000 vendas
        </div>
      </div>

      {/* Estoque e Quantidade */}
      <div className="px-4 pb-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-900">
            Estoque disponível
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              Quantidade: {quantity} ({product.stock || 5} disponíveis)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Garantias */}
      <div className="px-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-gray-700">
              <span className="text-blue-600 font-medium">Devolução grátis.</span> Você tem 30 dias a partir da data de recebimento.
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-gray-700">
              <span className="text-blue-600 font-medium">Compra Garantida</span>, receba o produto que está esperando ou devolvemos o dinheiro.
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-gray-700">30 dias de garantia de fábrica.</span>
          </div>
        </div>
      </div>

      {/* Botões de Ação Fixos */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex gap-3">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 h-12 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Adicionar ao carrinho
          </Button>
          <Button
            onClick={handleBuyNow}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Comprar agora
          </Button>
        </div>
      </div>

      {/* Espaçamento para botões fixos */}
      <div className="h-20"></div>
    </div>
  );
};

export default ProductHeroMobileMercadoLivre;

