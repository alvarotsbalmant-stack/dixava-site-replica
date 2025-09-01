import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { Star, Heart, Share2, ChevronDown, Shield, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';

interface ProductHeroMobileProps {
  product: Product;
  viewingCount: number;
  onAddToCart: (product: Product) => void;
}

const ProductHeroMobile: React.FC<ProductHeroMobileProps> = ({ 
  product, 
  viewingCount, 
  onAddToCart 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'pre-owned' | 'digital'>('new');
  const [quantity, setQuantity] = useState(1);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const rating = 4.8;
  const reviewCount = 127;

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

  const handleWhatsAppContact = () => {
    const message = `Olá! Gostaria de mais informações sobre:\n\n${product.name}\nPreço: ${formatPrice(product.price)}`;
    const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getCurrentPrice = () => {
    switch (selectedCondition) {
      case 'new':
        return product.price;
      case 'pre-owned':
        return product.price * 0.85;
      case 'digital':
        return product.digital_price || product.price * 0.9;
      default:
        return product.price;
    }
  };

  return (
    <div className="bg-white">
      {/* Image Gallery - Full Width */}
      <div className="relative">
        <div className="aspect-square bg-gray-100">
          <img
            src={images[selectedImageIndex] || product.image}
            alt={product.name}
            className="w-full h-full object-contain"
          />
          
          {/* Overlay Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFavorited(!isFavorited)}
              className={`w-10 h-10 p-0 bg-white/90 backdrop-blur-sm ${
                isFavorited ? 'text-red-600 border-red-200' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="w-10 h-10 p-0 bg-white/90 backdrop-blur-sm"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Social Proof Badge */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {viewingCount} pessoas vendo agora
            </div>
          </div>
        </div>

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden ${
                  selectedImageIndex === index ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-contain bg-gray-50" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-4">
        {/* Brand & Availability */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Shield className="w-3 h-3 mr-1" />
            Em estoque
          </Badge>
          <span className="text-sm text-gray-600">UTI dos Games</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          {product.name}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-900">{rating}</span>
          <button className="text-sm text-blue-600 underline">
            ({reviewCount})
          </button>
        </div>

        {/* Price Section */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-red-600 font-medium">Preço especial</span>
            <Badge variant="destructive" className="text-xs">-15%</Badge>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">
              {formatPrice(getCurrentPrice())}
            </span>
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price * 1.15)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mt-1">
            ou {formatPrice(getCurrentPrice() * 0.95)} no PIX (5% desconto)
          </div>
          
          <div className="text-sm text-gray-600">
            ou 12x de {formatPrice(getCurrentPrice() / 12)} sem juros
          </div>
        </div>

        {/* Condition Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Condição:</label>
          <div className="grid grid-cols-3 gap-2">
            {['new', 'pre-owned', 'digital'].map((condition) => (
              <button
                key={condition}
                onClick={() => setSelectedCondition(condition as any)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  selectedCondition === condition
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {condition === 'new' && 'Novo'}
                {condition === 'pre-owned' && 'Seminovo'}
                {condition === 'digital' && 'Digital'}
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">Formato:</label>
            <div className="flex gap-2 overflow-x-auto">
              {product.sizes.map((size) => (
                <Button
                  key={size}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Quantidade:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => onAddToCart(product)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12 text-base font-semibold"
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Fora de estoque' : 'Adicionar ao carrinho'}
          </Button>
          
          <Button
            onClick={handleWhatsAppContact}
            variant="outline"
            className="w-full border-green-500 text-green-600 hover:bg-green-50 h-12 text-base font-semibold"
          >
            Comprar via WhatsApp
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Frete GRÁTIS</div>
              <div className="text-xs text-gray-600">para Colatina-ES</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Produto original</div>
              <div className="text-xs text-gray-600">Lacrado de fábrica</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Troca garantida</div>
              <div className="text-xs text-gray-600">7 dias para trocar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeroMobile;