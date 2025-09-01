import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { Star, Heart, Share2, ChevronDown, Shield, Truck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/formatPrice';
import FavoriteButton from '@/components/FavoriteButton';
import { sendSingleProductToWhatsApp } from '@/utils/whatsapp';
import { PurchaseConfirmationModal } from '@/components/Product/PurchaseConfirmationModal';

interface ProductHeroMobileProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductHeroMobile: React.FC<ProductHeroMobileProps> = ({ 
  product, 
  onAddToCart 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'pre-owned' | 'digital'>('new');
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleWhatsAppContact = async () => {
    // Usar nova função para gerar código de verificação
    await sendSingleProductToWhatsApp(product, quantity, null, () => {
      // Track analytics
    });
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
      {/* Image Gallery - Mais Respiração */}
      <div className="relative mb-6">
        <div className="aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden mx-4">
          <img
            src={images[selectedImageIndex] || product.image}
            alt={product.name}
            className="w-full h-full object-contain p-4"
          />
          
          {/* Overlay Actions - Melhor Posicionamento */}
          <div className="absolute top-6 right-6 flex flex-col gap-3">
            <FavoriteButton 
              productId={product.id} 
              size="sm"
              className="w-12 h-12 bg-white/95 backdrop-blur-md shadow-lg border-0 rounded-full"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="w-12 h-12 p-0 bg-white/95 backdrop-blur-md shadow-lg border-0 rounded-full hover:bg-gray-50/95 transition-all duration-200"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Social Proof Badge - Melhor Design */}
          <div className="absolute bottom-6 left-6">

          </div>
        </div>

        {/* Image Thumbnails - Mais Espaçamento */}
        {images.length > 1 && (
          <div className="flex gap-3 px-4 mt-4 overflow-x-auto pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                  selectedImageIndex === index 
                    ? 'border-red-500 shadow-md scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-contain bg-gray-50 p-1" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info - Mais Espaçamento */}
      <div className="px-6 space-y-6">
        {/* Brand & Availability - Melhor Layout */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium">
            <Shield className="w-4 h-4 mr-2" />
            Em estoque
          </Badge>
          <span className="text-sm text-gray-500 font-medium">UTI dos Games</span>
        </div>

        {/* Title - Mais Respiração */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>
          
          {/* Rating - Melhor Design */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(rating) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">{rating}</span>
            <button className="text-sm text-blue-600 underline font-medium">
              ({reviewCount} avaliações)
            </button>
          </div>
        </div>

        {/* Condition Selector - Melhor Espaçamento */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Condição do Produto</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'new', label: 'Novo', desc: 'Lacrado' },
              { key: 'pre-owned', label: 'Usado', desc: '15% OFF' },
              { key: 'digital', label: 'Digital', desc: '10% OFF' }
            ].map((condition) => (
              <button
                key={condition.key}
                onClick={() => setSelectedCondition(condition.key as any)}
                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                  selectedCondition === condition.key
                    ? 'border-red-500 bg-red-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-gray-900">{condition.label}</div>
                <div className="text-sm text-gray-600 mt-1">{condition.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Section - Hierarquia Melhorada */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(getCurrentPrice())}
                </span>
                {selectedCondition !== 'new' && (
                  <Badge className="bg-red-100 text-red-800 font-semibold">
                    {selectedCondition === 'pre-owned' ? '15% OFF' : '10% OFF'}
                  </Badge>
                )}
              </div>
              {selectedCondition !== 'new' && (
                <div className="text-lg text-gray-500 line-through mt-1">
                  {formatPrice(product.price)}
                </div>
              )}
            </div>
          </div>

          {/* UTI PRO Price - Destaque Separado */}
          {product.pro_price && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-600 font-medium mb-1">
                    💎 Preço UTI PRO
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPrice(product.pro_price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Economize {formatPrice(product.price - product.pro_price)}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold px-6"
                >
                  Ser PRO
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quantity Selector - Melhor Design */}
        <div className="space-y-3">
          <label className="text-lg font-semibold text-gray-900">Quantidade</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-xl transition-colors"
                disabled={quantity <= 1}
              >
                <span className="text-xl font-bold">−</span>
              </button>
              <span className="w-16 text-center font-bold text-xl text-gray-900">
                {quantity}
              </span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-xl transition-colors"
                disabled={quantity >= 10}
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Máximo: 10 unidades
            </div>
          </div>
        </div>

        {/* Action Buttons - Melhor Espaçamento */}
        <div className="space-y-4 pt-2">
          <Button
            onClick={() => onAddToCart(product)}
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
            disabled={product.stock === 0}
          >
            🛒 Adicionar ao Carrinho
          </Button>
          
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
            disabled={product.stock === 0}
          >
            ⚡ Comprar Agora
          </Button>
          
          <Button
            onClick={handleWhatsAppContact}
            variant="outline"
            className="w-full h-14 border-2 border-green-500 text-green-600 hover:bg-green-50 font-bold text-lg rounded-xl transition-all duration-200"
          >
            💬 Falar no WhatsApp
          </Button>
        </div>

        {/* Benefits Cards - Melhor Layout */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          {[
            { icon: Truck, title: 'Entrega rápida', desc: '2-5 dias úteis' },
            { icon: Shield, title: 'Produto original', desc: 'Lacrado e garantido' },
            { icon: Clock, title: 'Troca garantida', desc: '7 dias para trocar' },
            { icon: Star, title: 'Atendimento UTI', desc: 'Suporte especializado' }
          ].map((benefit, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 text-center space-y-2 hover:shadow-md transition-shadow">
              <benefit.icon className="w-8 h-8 text-red-600 mx-auto" />
              <div className="font-semibold text-gray-900 text-sm">{benefit.title}</div>
              <div className="text-xs text-gray-600">{benefit.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE COMPRA */}
      <PurchaseConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{
          name: product.name,
          price: product.price,
          originalPrice: product.list_price,
          image: product.images?.[0] || '/placeholder.svg'
        }}
        quantity={quantity}
      />
    </div>
  );
};

export default ProductHeroMobile;

