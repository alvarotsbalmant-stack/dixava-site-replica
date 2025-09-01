// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductPage, useProductsEnhanced } from '@/hooks/useProductsEnhanced';
import { useProductSyncEvents } from '@/utils/productSyncEvents';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Users, Eye, Clock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';
import Cart from '@/components/Cart';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading: productsLoading, refreshProducts } = useProductsEnhanced();
  const { on } = useProductSyncEvents();
  const { addToCart, items, updateQuantity, getCartTotal, getCartItemsCount } = useCart();
  const { user } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [onlineUsers] = useState(Math.floor(Math.random() * 15) + 5);
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const product = products.find(p => p.id === id);
  const relatedProducts = products.filter(p => 
    p.id !== id && 
    (p.category === product?.category || p.platform === product?.platform)
  ).slice(0, 4);

  // Removido o scroll forçado para permitir restauração de posição

  // Sistema de sincronização em tempo real
  useEffect(() => {
    console.log('[ProductPage] Configurando listeners de sincronização para produto:', id);
    
    // Listener para atualizações específicas do produto atual
    const unsubscribeProductUpdated = on('product_updated', (event) => {
      if (event.productId === id) {
        console.log('[ProductPage] Produto atual foi atualizado no admin, atualizando página');
        toast.info('Produto atualizado! Recarregando dados...');
        refreshProducts();
      }
    });

    // Listener para quando o produto atual é deletado
    const unsubscribeProductDeleted = on('product_deleted', (event) => {
      if (event.productId === id) {
        console.log('[ProductPage] Produto atual foi deletado no admin');
        toast.error('Este produto foi removido!');
        navigate('/');
      }
    });

    // Listener para ações administrativas completadas
    const unsubscribeAdminActions = on('admin_action_completed', (event) => {
      if (event.productId === id) {
        console.log('[ProductPage] Ação administrativa completada para produto atual');
        // Pequeno delay para garantir que os dados estão atualizados
        setTimeout(() => {
          refreshProducts();
        }, 200);
      }
    });

    // Listener para refresh geral de produtos
    const unsubscribeProductsRefreshed = on('products_refreshed', (event) => {
      if (event.source === 'admin') {
        console.log('[ProductPage] Produtos atualizados pelo admin, sincronizando');
        refreshProducts();
      }
    });

    // Cleanup dos listeners
    return () => {
      unsubscribeProductUpdated();
      unsubscribeProductDeleted();
      unsubscribeAdminActions();
      unsubscribeProductsRefreshed();
      console.log('[ProductPage] Listeners de sincronização removidos');
    };
  }, [id, on, refreshProducts, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${product.name} adicionado ao carrinho!`);
    }
  };

  const handleBuyNow = async () => {
    // Usar nova função para gerar código de verificação
    await import('@/utils/whatsapp').then(({ sendSingleProductToWhatsApp }) => {
      return sendSingleProductToWhatsApp(product, 1, null, () => {
        // Track analytics
      });
    });
  };

  const handleCartOpen = () => setShowCart(true);
  const handleAuthOpen = () => setShowAuthModal(true);

  if (productsLoading) {
    return (
      <>
        <ProfessionalHeader onCartOpen={handleCartOpen} onAuthOpen={handleAuthOpen} />
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="aspect-square bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <ProfessionalHeader onCartOpen={handleCartOpen} onAuthOpen={handleAuthOpen} />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
            <Button onClick={() => navigate('/')} variant="outline">
              Voltar à página inicial
            </Button>
          </div>
        </div>
      </>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const pixPrice = product.price * 0.95; // 5% desconto no PIX

  return (
    <>
      <ProfessionalHeader onCartOpen={handleCartOpen} onAuthOpen={handleAuthOpen} />
      <div className="min-h-screen bg-white">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-gray-600">
              <span className="hover:text-red-600 cursor-pointer" onClick={() => navigate('/')}>
                Início
              </span>
              <span className="mx-2">/</span>
              <span className="hover:text-red-600 cursor-pointer">
                {product.platform}
              </span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Imagens do Produto */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white border rounded-lg overflow-hidden group">
                <img
                  src={product.images?.[selectedImageIndex] || product.image}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {discountPercentage > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                    -{discountPercentage}%
                  </Badge>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square border rounded-lg overflow-hidden ${
                        selectedImageIndex === index ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informações do Produto */}
            <div className="space-y-6">
              {/* Status e Social Proof */}
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Em estoque
                </Badge>
                <div className="flex items-center text-gray-600">
                  <Eye className="w-4 h-4 mr-1" />
                  {onlineUsers} pessoas visualizando
                </div>
              </div>

              {/* Título */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">4.5 (233 avaliações)</span>
                </div>
              </div>

              {/* Preços */}
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">💳 Preço no PIX</p>
                      <p className="text-2xl font-bold text-green-800">
                        R$ {pixPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-green-600">
                        Economia de R$ {(product.price - pixPrice).toFixed(2)} • 5% OFF
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantidade e Ações */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Quantidade:</label>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3"
                    >
                      -
                    </Button>
                    <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  {/* Comprar Agora - Botão Primário Premium (Estilo Mercado Livre Moderno) */}
                  <Button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl h-14 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out border-0 relative overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      Comprar agora
                    </div>
                  </Button>
                  
                  {/* Adicionar ao Carrinho - Botão Secundário Premium */}
                  <Button 
                    onClick={handleAddToCart}
                    variant="outline"
                    className="flex-1 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-semibold text-lg rounded-xl h-14 shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 ease-out relative overflow-hidden group"
                    size="lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 mr-3" />
                      Adicionar ao carrinho
                    </div>
                  </Button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Entrega Rápida</p>
                    <p className="text-sm text-gray-600">2-5 dias úteis</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Produto Original</p>
                    <p className="text-sm text-gray-600">Lacrado e garantido</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Garantia</p>
                    <p className="text-sm text-gray-600">UTI dos Games</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abas de Informações */}
          <div className="mt-16">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Descrição</TabsTrigger>
                <TabsTrigger value="specifications">Especificações</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description || "Experience the best value in gaming with Xbox Series X – 1TB Digital Edition. Enjoy thousands of games across four generations of Xbox, with faster loading, improved frame rates, and richer, more dynamic worlds. **Principais Características:** - **Velocidade:** Carregamento ultrarrápido com SSD NVMe personalizado. - **Gráficos:** Ray tracing acelerado por hardware para visuais incríveis. - **Compatibilidade:** Jogue milhares de títulos de quatro gerações de Xbox. - **Som:** Áudio espacial 3D imersivo. - **Design:** Compacto e elegante, ideal para qualquer setup de jogos."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="specifications" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Informações Gerais</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li><strong>Plataforma:</strong> {product.platform}</li>
                          <li><strong>Categoria:</strong> {product.category}</li>
                          <li><strong>Condição:</strong> Novo</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Detalhes do Produto</h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li><strong>Código:</strong> {product.id}</li>
                          <li><strong>Disponibilidade:</strong> Em estoque</li>
                          <li><strong>Garantia:</strong> 90 dias</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="faq" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    {product.product_faqs && product.product_faqs.length > 0 ? (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Perguntas Frequentes</h3>
                        <div className="space-y-4">
                          {product.product_faqs.map((faq, index) => (
                            <div key={faq.id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                              <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                              <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
                              {faq.category && (
                                <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {faq.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Nenhuma pergunta frequente disponível para este produto.</p>
                        <p className="text-sm text-gray-400">Entre em contato conosco se tiver alguma dúvida!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">4.5</div>
                          <div className="flex items-center justify-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-sm text-gray-600">233 avaliações</div>
                        </div>
                        <div className="flex-1">
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => (
                              <div key={stars} className="flex items-center gap-2">
                                <span className="text-sm w-3">{stars}</span>
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-400 h-2 rounded-full" 
                                    style={{ width: `${stars === 5 ? 60 : stars === 4 ? 30 : 10}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 w-8">
                                  {stars === 5 ? '60%' : stars === 4 ? '30%' : '10%'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Produtos Relacionados */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Produtos Relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card 
                    key={relatedProduct.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/produto/${relatedProduct.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-red-600">
                        R$ {relatedProduct.price.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Cart Modal */}
      <Cart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)}
        items={items}
        updateQuantity={updateQuantity}
        getCartTotal={getCartTotal}
        getCartItemsCount={getCartItemsCount}
      />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default ProductPage;

