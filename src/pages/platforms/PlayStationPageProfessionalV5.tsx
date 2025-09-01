// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Loader2, Zap, Play, Star, ShoppingCart, Gamepad2, Headphones, Camera, Trophy, Users, Download, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import Cart from '@/components/Cart';
import { AuthModal } from '@/components/Auth/AuthModal';
import { usePlayStationData } from '@/hooks/usePlayStationData';

// Componente de cartão de produto otimizado para PlayStation V5
const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleProductClick = (productId) => {
    navigate(`/produto/${productId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col h-full border border-gray-100 w-full min-w-0"
      onClick={() => handleProductClick(product.id)}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/5]">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.discount && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            -{product.discount}%
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-[#00CC66] to-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            NOVO
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            DESTAQUE
          </div>
        )}
        {product.isExclusive && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-[#003791] to-[#0070CC] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            EXCLUSIVO
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#003791] transition-colors duration-300">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                R$ {product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-xl font-bold text-[#003791]">
              R$ {product.price.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            className="w-full bg-gradient-to-r from-[#003791] to-[#0070CC] hover:from-[#0070CC] hover:to-[#003791] text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm md:text-base"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const PlayStationPageProfessionalV5 = () => {
  const { consoles, games, accessories, deals, newsArticles, loading, error } = usePlayStationData();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Ref para o hero banner para efeito de parallax
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Transformações para efeito de parallax
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    document.title = 'PlayStation | UTI dos Games - Consoles, Jogos e Acessórios';
  }, []);

  const handleCartOpen = () => {
    setShowCart(true);
  };

  const handleAuthOpen = () => {
    setShowAuthModal(true);
  };

  const handleAuthClose = () => {
    setShowAuthModal(false);
  };

  // Loading state real - igual Xbox4
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003791] to-[#0070D1] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    console.warn('Erro ao carregar dados PlayStation:', error);
    // Continuar com dados fallback que já estão no hook
  }

  // Organizar produtos para as seções
  const playstationProducts = {
    consoles,
    games,
    accessories,
    deals
  };

  // Dados de notícias e trailers (fallback) - usar do hook
  const defaultNewsAndTrailers = newsArticles.length > 0 ? newsArticles : [
    {
      id: 1,
      type: 'news',
      title: 'PlayStation 5: Novos Jogos Exclusivos',
      description: 'Confira os lançamentos exclusivos que chegam ao PS5 este mês.',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=400&fit=crop&crop=center',
      date: '2 dias atrás'
    }
  ];

  return (
    <div className="min-h-screen bg-white needs-desktop-spacing">
      <ProfessionalHeader onCartOpen={handleCartOpen} onAuthOpen={handleAuthOpen} />
      
      {/* Hero Banner - Inspirado na PlayStation Store */}
      <section 
        ref={heroRef}
        className="relative min-h-screen bg-gradient-to-br from-[#003791] via-[#0070CC] to-[#003791] overflow-hidden flex items-center justify-center"
      >
        {/* Elementos visuais de fundo com símbolos PlayStation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            style={{ y: heroY }}
            className="absolute top-20 left-10 text-white/5 text-8xl animate-pulse font-bold"
          >
            ○
          </motion.div>
          <motion.div 
            style={{ y: heroY }}
            className="absolute top-40 right-20 text-white/5 text-6xl animate-pulse font-bold"
          >
            ✕
          </motion.div>
          <motion.div 
            style={{ y: heroY }}
            className="absolute bottom-40 left-20 text-white/5 text-7xl animate-pulse font-bold"
          >
            □
          </motion.div>
          <motion.div 
            style={{ y: heroY }}
            className="absolute bottom-20 right-10 text-white/5 text-5xl animate-pulse font-bold"
          >
            △
          </motion.div>
        </div>
        
        {/* Overlay com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30"></div>
        
        {/* Conteúdo do hero */}
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight">
                Play<span className="text-[#00D4FF]">Station</span>
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-[#00D4FF] to-[#0070CC] mx-auto mb-6"></div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-8 font-light leading-relaxed"
            >
              Entre no universo PlayStation e descubra jogos exclusivos, tecnologia de ponta e experiências únicas que só o PS5 pode oferecer.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                size="lg" 
                className="bg-white text-[#003791] hover:bg-gray-100 font-bold py-4 px-8 rounded-full text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById('consoles-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Gamepad2 className="w-6 h-6 mr-3" />
                Explorar Consoles
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-[#003791] font-bold py-4 px-8 rounded-full text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => document.getElementById('games-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="w-6 h-6 mr-3" />
                Ver Jogos Exclusivos
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Indicador de scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
          </div>
        </motion.div>
      </section>

      {/* Seção de Consoles */}
      <section id="consoles-section" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Consoles <span className="text-[#003791]">PlayStation</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra o poder do PlayStation 5 e experimente jogos como nunca antes com tecnologia de ponta e gráficos impressionantes.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playstationProducts.consoles.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Jogos Exclusivos */}
      <section id="games-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Jogos <span className="text-[#003791]">Exclusivos</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mergulhe em aventuras épicas disponíveis apenas no PlayStation. Histórias inesquecíveis e gameplay revolucionário.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {playstationProducts.games.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Acessórios */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Acessórios <span className="text-[#003791]">Oficiais</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete sua experiência PlayStation com acessórios oficiais que elevam sua gameplay a um novo patamar.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playstationProducts.accessories.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Seção de Ofertas */}
      {playstationProducts.deals.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-[#003791] to-[#0070CC]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Ofertas <span className="text-[#00D4FF]">Especiais</span>
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Aproveite descontos exclusivos em produtos PlayStation selecionados. Ofertas por tempo limitado!
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {playstationProducts.deals.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seção de Notícias */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Últimas <span className="text-[#003791]">Notícias</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fique por dentro das novidades do mundo PlayStation com notícias, trailers e lançamentos.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {defaultNewsAndTrailers.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#003791] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {article.type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{article.date}</span>
                    <Button variant="outline" size="sm" className="text-[#003791] border-[#003791] hover:bg-[#003791] hover:text-white">
                      Ler mais
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart e Auth Modals */}
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
      <AuthModal isOpen={showAuthModal} onClose={handleAuthClose} />
    </div>
  );
};

export default PlayStationPageProfessionalV5;

