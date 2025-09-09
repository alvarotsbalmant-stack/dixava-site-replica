import React, { useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { SKUNavigation } from '@/hooks/useProducts/types';
import { ShoppingCart, Heart, Share2, Star, Truck, Shield, Clock, Check, Plus, Minus, ChevronRight, ChevronLeft, Zap, Coins, Tag, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import FavoriteButton from '@/components/FavoriteButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useUTICoins } from '@/contexts/UTICoinsContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useProductSpecifications } from '@/hooks/useProductSpecifications';
import { useProductFAQs } from '@/hooks/useProductFAQs';
import RelatedProductsCarousel from '../MainContent/RelatedProductsCarousel';
import DynamicDeliveryMobile from './DynamicDeliveryMobile';
import GoogleReviewsMobile from '../Sidebar/GoogleReviewsMobile';
import { sendSingleProductToWhatsApp } from '@/utils/whatsapp';
import { useWhatsAppLoading } from '@/hooks/useWhatsAppLoading';
import WhatsAppLoadingOverlay from '@/components/ui/WhatsAppLoadingOverlay';

interface ProductPageMobileMercadoLivreProps {
  product: Product;
  skuNavigation?: SKUNavigation;
  onAddToCart: (product: Product) => void;
}

const ProductPageMobileMercadoLivre: React.FC<ProductPageMobileMercadoLivreProps> = ({ 
  product, 
  skuNavigation,
  onAddToCart 
}) => {
  // Estados para controle da interface
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Hooks do sistema
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { earnCoins } = useUTICoins();
  const { trackEvent } = useAnalytics();
  const { specifications } = useProductSpecifications(product.id);
  const { faqs } = useProductFAQs(product.id);
  const { isLoading: isWhatsAppLoading, showLoading } = useWhatsAppLoading();

  // Dados calculados
  const allImages = [product.image, ...(product.additional_images || [])].filter(Boolean);
  const discountPercentage = product.list_price && product.list_price > product.price 
    ? Math.round(((product.list_price - product.price) / product.list_price) * 100)
    : 0;
  const installmentPrice = product.price / 12;
  const pixPrice = product.price * 0.95;

  // Especificações principais (primeiras 9)
  const mainSpecs = specifications?.slice(0, 9) || [
    { label: 'Categoria', value: product.category },
    { label: 'Plataforma', value: product.platform || 'Múltiplas' },
    { label: 'Condição', value: 'Novo' },
    { label: 'Marca', value: 'UTI dos Games' },
    { label: 'Ano', value: '2024' }
  ];

  // CORREÇÃO: Garantir scroll ao topo quando componente mobile monta
  useEffect(() => {
    console.log('🔧 [ProductPageMobileMercadoLivre] Componente mobile montado, forçando scroll ao topo');
    window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
  }, []);

  // Tracking de visualização
  useEffect(() => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price
    });
  }, [product.id]);

  // Handlers
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
      // Adicionar múltiplas vezes baseado na quantidade
      for (let i = 0; i < quantity; i++) {
        await addToCart(product);
      }
      
      trackEvent('add_to_cart', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: quantity
      });
      
      if (user) {
        await earnCoins('add_to_cart', 10 * quantity, `Adicionou ${quantity}x ${product.name} ao carrinho`);
      }
      
      // Remover chamada duplicada - onAddToCart não deve ser chamado aqui
      // pois addToCart já adiciona ao carrinho
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
    }
  };

  const handleBuyNow = async () => {
    // MESMA LÓGICA DO DESKTOP - usar função sendSingleProductToWhatsApp com loading
    await sendSingleProductToWhatsApp(product, quantity, null, () => {
      // Track analytics
      trackEvent('buy_now_click', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: quantity
      });
    }, showLoading); // Adicionar callback de loading
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Título do Produto - MOVIDO PARA O TOPO */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-medium text-gray-900 leading-tight">
          {product.name}
        </h1>
      </div>

      {/* Header com badges - ABAIXO DO TÍTULO */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Badges - EXATAMENTE como ML */}
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
          
          <div className="flex items-center gap-2">
            <FavoriteButton productId={product.id} size="sm" />
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Galeria de Imagens - REDUZIDA EM 50% */}
      <div className="relative">
        <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
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

          {/* Indicadores - EXATAMENTE como ML */}
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

          {/* Contador de imagens - EXATAMENTE como ML */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
            {selectedImageIndex + 1}/{allImages.length}
          </div>
        </div>
      </div>

      {/* Seção de Preços - SEM CARD */}
      <div className="p-4">
        {/* Preço de lista em cima */}
        {product.list_price && product.list_price > product.price && (
          <div className="text-sm text-gray-500 line-through">
            R$ {product.list_price.toFixed(2).replace(".", ",")}
          </div>
        )}
        
        {/* Preço principal e desconto na mesma linha */}
        <div className="flex items-baseline">
          <span className="text-2xl font-medium text-gray-900">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          {product.list_price && product.list_price > product.price && (
            <span className="text-green-600 text-xs font-bold ml-2 relative -top-2">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
        
        <Button variant="ghost" className="text-blue-600 p-0 h-auto text-sm mt-3 mb-4">
          Ver os meios de pagamento
        </Button>

        {/* Card de Frete Dinâmico */}
        <DynamicDeliveryMobile productPrice={product.price} />

        {/* UTI Coins - Cashback (só aparece se tiver configurado) */}
        {product.uti_coins_cashback_percentage && product.uti_coins_cashback_percentage > 0 && (
          <>
            <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span>Ganhe <span className="font-medium text-yellow-700">{Math.ceil((product.price * quantity * (product.uti_coins_cashback_percentage || 0)) / 100 * 100)} UTI Coins</span> nesta compra</span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              = R$ {(Math.ceil((product.price * quantity * (product.uti_coins_cashback_percentage || 0)) / 100 * 100) * 0.01).toFixed(2)} para próximas compras
            </div>
          </>
        )}

        {/* UTI Coins - Desconto (só aparece se tiver configurado) */}
        {product.uti_coins_discount_percentage && product.uti_coins_discount_percentage > 0 && (
          <div className="text-sm text-green-600 mb-4 flex items-center gap-1">
            <Tag className="w-4 h-4 text-green-600" />
            <span>
              Até <span className="font-medium">{product.uti_coins_discount_percentage}% OFF</span> pagando com UTI Coins - 
              Economize até <span className="font-medium">R$ {((product.price * (product.uti_coins_discount_percentage || 0)) / 100).toFixed(2).replace(".", ",")}</span>
            </span>
          </div>
        )}

        {/* Espaçamento só se tiver alguma seção UTI Coins */}
        {((product.uti_coins_cashback_percentage && product.uti_coins_cashback_percentage > 0) || 
          (product.uti_coins_discount_percentage && product.uti_coins_discount_percentage > 0)) && (
          <div className="mb-2"></div>
        )}
      </div>

      {/* Estoque e Quantidade - SEM CARD AMARELO */}
      <div className="px-4 pb-4">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-900 mb-2">
              Estoque disponível
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Quantidade: {quantity} ({product.stock || 5} disponíveis)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Botões CTA da versão desktop - LOGO APÓS QUANTIDADE */}
          <div className="space-y-3">
            {/* Botão Comprar Agora - DESTAQUE PRINCIPAL */}
            <Button
              onClick={handleBuyNow}
              size="lg"
              disabled={product.stock === 0}
              className="w-full font-bold text-lg h-12 rounded-lg shadow-lg transition-all duration-300 bg-red-600 hover:bg-red-700 text-white hover:shadow-xl active:scale-[0.98]"
            >
              <Zap className="w-5 h-5 mr-2" />
              Comprar agora
            </Button>

            {/* Botão Adicionar ao Carrinho */}
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="lg"
              disabled={product.stock === 0}
              className="w-full font-semibold h-12 rounded-lg transition-all duration-300 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 active:scale-[0.98]"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </div>

      {/* Garantias - EXATAMENTE como ML */}
      <div className="px-4 py-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <span className="text-gray-700">
              <span className="text-blue-600 font-medium">Devolução gratuita.</span> Prazo de 30 dias a partir do recebimento.
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <span className="text-gray-700">
              <span className="text-blue-600 font-medium">Compra protegida.</span> Receba o produto correto ou seu dinheiro de volta.
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-2.5 h-2.5 text-blue-600" />
            </div>
            <span className="text-gray-700">Até 36 meses de garantia para produtos selecionados.</span>
          </div>
        </div>
      </div>

      {/* Avaliações Google - substituindo seção de informações do produto */}
      <GoogleReviewsMobile />



      {/* Fotos do produto - EXATAMENTE como ML */}
      {product.additional_images && product.additional_images.length > 0 && (
        <div className="border-t border-gray-100 p-4">
          <h3 className="font-medium text-gray-900 mb-4">Fotos do produto</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(showAllPhotos ? product.additional_images : product.additional_images.slice(0, 4)).map((image, index) => (
              <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
          {product.additional_images.length > 4 && (
            <Button
              variant="outline"
              onClick={() => setShowAllPhotos(!showAllPhotos)}
              className="w-full text-blue-600 border-blue-600"
            >
              {showAllPhotos ? 'Ver menos fotos' : 'Ver mais fotos'}
            </Button>
          )}
        </div>
      )}

      {/* Descrição - EXATAMENTE como ML */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Descrição</h3>
        <div className="text-sm text-gray-700 leading-relaxed">
          <div className={showFullDescription ? '' : 'line-clamp-6'}>
            {product.description || `${product.name}\n\nProduto de alta qualidade da UTI dos Games.\n\nTenha a melhor experiência de jogo com este produto incrível! Desenvolvido com tecnologia de ponta e materiais de primeira qualidade, este item é perfeito para quem busca excelência e diversão.\n\nCaracterísticas especiais que fazem toda a diferença na sua experiência de jogo. Com este produto você terá acesso a funcionalidades exclusivas e uma qualidade incomparável.\n\nEscolha a UTI dos Games e tenha a certeza de estar adquirindo um produto de qualidade superior!`}
          </div>
        </div>
        {/* 🔧 CORREÇÃO: Só mostrar botão se descrição for longa (mais de 200 caracteres) */}
        {(product.description || `${product.name}\n\nProduto de alta qualidade da UTI dos Games.\n\nTenha a melhor experiência de jogo com este produto incrível! Desenvolvido com tecnologia de ponta e materiais de primeira qualidade, este item é perfeito para quem busca excelência e diversão.\n\nCaracterísticas especiais que fazem toda a diferença na sua experiência de jogo. Com este produto você terá acesso a funcionalidades exclusivas e uma qualidade incomparável.\n\nEscolha a UTI dos Games e tenha a certeza de estar adquirindo um produto de qualidade superior!`).length > 200 && (
          <Button
            variant="ghost"
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-blue-600 p-0 h-auto mt-2"
          >
            {showFullDescription ? 'Ver menos' : 'Ver descrição completa'}
          </Button>
        )}
      </div>

      {/* Produtos relacionados - SEM TÍTULO */}
      <div className="border-t border-gray-100 p-4">
        <RelatedProductsCarousel currentProduct={product} />
      </div>

      {/* Você também pode estar interessado - EXATAMENTE como ML */}
      <div className="border-t border-gray-100 p-4">
        <h3 className="font-medium text-gray-900 mb-4">Você também pode estar interessado:</h3>
        <div className="flex flex-wrap gap-2">
          {[
            product.category.toLowerCase(),
            product.platform?.toLowerCase() || 'games',
            'jogos',
            'games',
            'console',
            'acessórios',
            'gaming'
          ].map((term, index) => (
            <Button key={index} variant="outline" size="sm" className="text-blue-600 border-blue-600">
              {term}
            </Button>
          ))}
        </div>
      </div>
      {/* Espaçamento final */}
      <div className="h-6"></div>

      {/* Loading Overlay para WhatsApp */}
      <WhatsAppLoadingOverlay isVisible={isWhatsAppLoading} />
    </div>
  );
};

export default ProductPageMobileMercadoLivre;

