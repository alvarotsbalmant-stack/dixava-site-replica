import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { Star, Heart, Share2, Clock, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductGallery from './ProductGallery';
import ProductPricing from './ProductPricing';
import ProductActions from '@/components/ProductPage/ProductActions';
import FavoriteButton from '@/components/FavoriteButton';

interface ProductHeroProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductHero: React.FC<ProductHeroProps> = ({ product, onAddToCart }) => {
  const [selectedCondition, setSelectedCondition] = useState<'new' | 'pre-owned' | 'digital'>('new');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Mock de avaliações
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
    const message = `Olá! Gostaria de mais informações sobre:\n\n${product.name}\nPreço: R$ ${product.price.toFixed(2)}`;
    const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Nova estrutura em 4 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA 1: Galeria Vertical (1 coluna) */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-4">
              <ProductGallery product={product} layout="vertical" />
            </div>
          </div>

          {/* COLUNA 2: Imagem Principal (4 colunas) */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="lg:sticky lg:top-4">
              <ProductGallery product={product} layout="main" />
            </div>
          </div>

          {/* COLUNA 3: Título, Preço, Avaliações (4 colunas) */}
          <div className="lg:col-span-4 order-3 space-y-6">
            {/* Badges e Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800 font-medium">
                  <Shield className="w-3 h-3 mr-1" />
                  Em estoque
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton productId={product.id} size="sm" />
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
                {product.name}
              </h1>
              
              {/* Avaliações */}
              <div className="flex items-center gap-4">
                <div className="flex items-center">
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
                  <span className="ml-2 text-lg font-semibold text-gray-900">{rating}</span>
                </div>
                <button className="text-sm text-blue-600 hover:underline">
                  ({reviewCount} avaliações)
                </button>
              </div>
            </div>

            {/* Preços */}
            <ProductPricing 
              product={product}
              selectedCondition={selectedCondition}
              onConditionChange={setSelectedCondition}
            />

            {/* Seleção de Variações */}
            {(product.sizes && product.sizes.length > 0) && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Formato:
                </label>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSize(size)}
                      className={selectedSize === size ? 'bg-red-600 hover:bg-red-700' : ''}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição básica do produto */}
            <div className="text-gray-600">
              <p className="text-sm leading-relaxed">
                {product.description ? product.description.substring(0, 200) + '...' : 
                 'Produto original, lacrado e com garantia. Entrega rápida e segura.'}
              </p>
            </div>
          </div>

          {/* COLUNA 4: Compra e Entrega (3 colunas) */}
          <div className="lg:col-span-3 order-4">
            <div className="lg:sticky lg:top-4 space-y-6">
              
              {/* Frete Grátis - Componente existente */}
              <div className="bg-white border border-green-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-gray-900">Frete Grátis</span>
                    <div className="text-sm text-gray-600">Entrega sem custo adicional</div>
                  </div>
                  <Badge className="bg-green-700 text-white text-xs px-2 py-1">
                    GARANTIDO
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Acima de R$ 99</span>
                    </div>
                    <div className="w-4 h-4 border-2 border-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Para Brasil</span>
                    </div>
                    <div className="w-4 h-4 border-2 border-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Entrega em 3-5 dias</span>
                    </div>
                    <div className="w-4 h-4 border-2 border-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações do Produto */}
              <ProductActions
                product={product}
                onAddToCart={() => onAddToCart(product)}
              />

              {/* Trust Indicators - Reorganizados */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Entrega rápida</div>
                      <div className="text-xs text-gray-600">2-5 dias úteis</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Produto original</div>
                      <div className="text-xs text-gray-600">Lacrado e garantido</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Troca garantida</div>
                      <div className="text-xs text-gray-600">7 dias para trocar</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Atendimento UTI</div>
                      <div className="text-xs text-gray-600">Suporte especializado</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHero;

