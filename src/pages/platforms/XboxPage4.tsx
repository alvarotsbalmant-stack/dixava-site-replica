
import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Loader2, Zap, Play, ChevronRight, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import { useXbox4Data } from '@/hooks/useXbox4Data';
import HexagonParticles from '@/components/Xbox4/HexagonParticles';
import ProductCard from '@/components/Xbox4/ProductCard';
import Xbox4GameHighCard from '@/components/Xbox4/Xbox4GameHighCard';
import NewsCard from '@/components/Xbox4/NewsCard';
import Cart from '@/components/Cart';
import { AuthModal } from '@/components/Auth/AuthModal';

const XboxPage4 = () => {
  const { consoles, games, accessories, deals, newsArticles, loading, error } = useXbox4Data();
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
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  
  // Dados de notícias e trailers (fallback)
  const defaultNewsAndTrailers = [
    {
      id: 1,
      type: 'trailer',
      title: 'Halo Infinite: Nova Temporada',
      description: 'Confira o trailer da nova temporada de Halo Infinite com novos mapas, armas e modos de jogo.',
      imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop&crop=center',
      date: '3 dias atrás'
    },
    {
      id: 2,
      type: 'news',
      title: 'Xbox Game Pass: Novos Jogos de Junho',
      description: 'Microsoft anuncia a nova leva de jogos que chegam ao Xbox Game Pass em junho, incluindo títulos AAA e indies premiados.',
      imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&h=400&fit=crop&crop=center',
      date: '1 semana atrás'
    },
    {
      id: 3,
      type: 'event',
      title: 'Xbox Showcase 2025: O que esperar',
      description: 'Confira nossa análise sobre o que esperar do próximo Xbox Showcase, com rumores de novos jogos e possíveis surpresas.',
      imageUrl: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?w=600&h=400&fit=crop&crop=center',
      date: '2 dias atrás'
    }
  ];

  // Dados de exemplo para fallback caso não haja produtos
  const fallbackProducts = {
    consoles: [
      {
        id: 'fallback-1',
        name: 'Xbox Series X',
        price: 3999.90,
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop&crop=center',
        isFeatured: true
      },
      {
        id: 'fallback-2',
        name: 'Xbox Series X - 1TB Digital Edition',
        price: 4599.90,
        originalPrice: 4899.90,
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop&crop=center',
        isNew: true
      }
    ],
    games: [
      {
        id: 'fallback-3',
        name: 'Halo Infinite',
        price: 299.90,
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop&crop=center'
      },
      {
        id: 'fallback-4',
        name: 'Forza Horizon 5',
        price: 249.90,
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop&crop=center'
      }
    ],
    accessories: [
      {
        id: 'fallback-5',
        name: 'Controle Xbox Series X Wireless',
        price: 499.90,
        imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&h=400&fit=crop&crop=center'
      }
    ],
    deals: [
      {
        id: 'fallback-6',
        name: 'Xbox Game Pass Ultimate (3 meses)',
        price: 119.90,
        originalPrice: 149.90,
        discount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&h=400&fit=crop&crop=center',
        isFeatured: true
      }
    ]
  };

  useEffect(() => {
    document.title = 'Xbox | UTI dos Games - Consoles, Jogos e Acessórios';
  }, []);
  
  // Usar produtos do banco ou fallback
  const displayProducts = {
    consoles: consoles.length > 0 ? consoles : fallbackProducts.consoles,
    games: games.length > 0 ? games : fallbackProducts.games,
    accessories: accessories.length > 0 ? accessories : fallbackProducts.accessories,
    deals: deals.length > 0 ? deals : fallbackProducts.deals
  };

  // Usar notícias do banco ou fallback
  const displayNews = newsArticles.length > 0 ? newsArticles : defaultNewsAndTrailers;

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleProductClick = (productId) => {
    navigate(`/produto/${productId}`);
  };

  const handleCartOpen = () => {
    setShowCart(true);
  };

  const handleAuthOpen = () => {
    setShowAuthModal(true);
  };

  // Handlers para navegação de seções usando template padrão
  const handleViewAllGames = () => {
    navigate('/secao/xbox4_games');
  };

  const handleViewAllAccessories = () => {
    navigate('/secao/xbox4_accessories');
  };

  // Mostrar loader apenas por um curto período inicial
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#107C10]" />
      </div>
    );
  }

  if (error) {
    console.warn('Erro ao carregar dados Xbox4:', error);
    // Continuar com dados fallback
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfessionalHeader onCartOpen={handleCartOpen} onAuthOpen={handleAuthOpen} />
      
      {/* Hero Banner */}
      <section 
        ref={heroRef}
        className="relative h-[60vh] md:h-screen max-h-[800px] bg-black overflow-hidden flex items-center justify-center"
      >
        {/* Background com padrão de hexágonos e partículas */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=1920&h=1080&fit=crop&crop=center')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            scale: heroScale,
            y: heroY
          }}
        />
        
        {/* Overlay com gradiente e padrão hexagonal */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
        
        {/* Partículas hexagonais animadas */}
        <div className="hidden md:block">
          <HexagonParticles />
        </div>
        
        {/* Conteúdo do hero */}
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-center md:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4 md:mb-6 flex justify-center md:justify-start"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg" 
                alt="Xbox Logo" 
                className="h-12 md:h-24"
              />
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-3xl font-black mb-4 leading-tight tracking-tight md:text-7xl md:mb-6"
              >
                POWER YOUR <br />
                <span className="text-[#107C10] drop-shadow-[0_0_10px_rgba(16,124,16,0.5)]">DREAMS</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-sm text-gray-300 mb-6 max-w-xl leading-normal md:text-xl md:mb-8"
              >
                Entre na próxima geração de jogos com Xbox Series X|S
              </motion.p> 
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col gap-3 sm:flex-row sm:gap-4 max-w-sm mx-auto md:max-w-none md:mx-0"
            >
              <Button 
                size="lg" 
                variant="xboxPrimary"
                className="font-bold px-6 py-3 h-12 text-sm rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#107C10]/30 md:h-12 md:px-8 md:text-base"
              >
                <Zap className="w-4 h-4 mr-2" />
                EXPLORAR CONSOLES
              </Button>
              <Button 
                size="lg" 
                variant="xboxSecondary"
                className="font-bold px-6 py-3 h-12 text-sm rounded-md transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Play className="w-4 h-4 mr-2" />
                VER JOGOS
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Indicador de scroll */}
        <motion.div 
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 md:bottom-8"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/50 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-white/50 rotate-90" />
          </div>
        </motion.div>
      </section>

      {/* Seção de Consoles */}
      <section className="py-8 bg-black relative overflow-hidden md:py-24">
        {/* Fundo com textura sutil ou gradiente */}
        <div className="absolute inset-0 bg-[url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAwTDYwIDMwIDMwIDYwIDAgMzB6IiBmaWxsPSIjMTA3QzEwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+\')] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-16"
          >
            <h2 className="text-2xl font-black mb-2 leading-tight tracking-tight md:text-6xl md:mb-4">
              CONSOLES <span className="text-[#107C10]">XBOX</span>
            </h2>
            <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-normal px-4 md:text-xl md:px-0">
              Desempenho inigualável para a nova geração de jogos. 
              Escolha o console Xbox perfeito para sua experiência.
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-8 md:overflow-visible md:mx-0 md:px-0">
            {displayProducts.consoles.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                className="min-w-[280px] snap-start flex-shrink-0 md:min-w-0"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Xbox Games Section */}
      <section className="py-8 bg-gray-950 relative overflow-hidden md:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAwTDYwIDMwIDMwIDYwIDAgMzB6IiBmaWxsPSIjMTA3QzEwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+\')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-16"
          >
            <h2 className="text-2xl font-black mb-2 leading-tight tracking-tight md:text-6xl md:mb-4">
              JOGOS <span className="text-[#107C10]">EM ALTA</span>
            </h2>
            <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-normal px-4 md:text-xl md:px-0">
              Os títulos mais populares para Xbox. De aventuras épicas a competições intensas, 
              encontre seu próximo jogo favorito.
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-x-4 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-8 md:overflow-visible md:mx-0 md:px-0">
            {displayProducts.games.slice(0, 10).map((product, index) => (
              <Xbox4GameHighCard 
                key={product.id}
                game={product}
                index={index}
                onGameClick={handleProductClick}
                className="min-w-[160px] md:min-w-[200px] snap-start flex-shrink-0"
              />
            ))}
          </div>
          
          <div className="mt-8 text-center md:mt-12">
            <Button 
              size="lg" 
              onClick={handleViewAllGames}
              className="bg-[#107C10] hover:bg-[#0D5A0D] text-white font-bold px-6 py-3 h-12 text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#107C10]/30 md:px-8 md:py-6 md:text-lg md:h-auto cursor-pointer"
            >
              VER TODOS OS JOGOS <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Acessórios Section */}
      <section className="py-8 bg-zinc-900 relative overflow-hidden md:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAwTDYwIDMwIDMwIDYwIDAgMzB6IiBmaWxsPSIjMTA3QzEwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+\')] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-16"
          >
            <h2 className="text-2xl font-black mb-2 leading-tight tracking-tight md:text-6xl md:mb-4">
              <span className="text-[#107C10]">ACESSÓRIOS</span> XBOX
            </h2>
            <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-normal px-4 md:text-xl md:px-0">
              Eleve sua experiência de jogo com acessórios oficiais Xbox. Controles, headsets e 
              muito mais para o seu setup.
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-8 md:overflow-visible md:mx-0 md:px-0">
            {displayProducts.accessories.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                variant="accessory"
                className="min-w-[280px] snap-start flex-shrink-0 md:min-w-0"
              />
            ))}
          </div>
          
          <div className="mt-8 text-center md:mt-12">
            <Button 
              size="lg" 
              onClick={handleViewAllAccessories}
              className="bg-transparent hover:bg-[#107C10] text-[#107C10] hover:text-white font-bold border-2 border-[#107C10] px-6 py-3 h-12 text-sm transition-all duration-300 md:px-8 md:py-6 md:text-lg md:h-auto cursor-pointer"
            >
              VER TODOS OS ACESSÓRIOS <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Notícias e Trailers Section */}
      <section className="py-8 bg-neutral-950 relative overflow-hidden md:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAwTDYwIDMwIDMwIDYwIDAgMzB6IiBmaWxsPSIjMTA3QzEwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+\')] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-16"
          >
            <h2 className="text-2xl font-black mb-2 leading-tight tracking-tight md:text-6xl md:mb-4">
              ÚLTIMAS <span className="text-[#107C10]">NOTÍCIAS</span>
            </h2>
            <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-normal px-4 md:text-xl md:px-0">
              Fique por dentro de tudo que acontece no universo Xbox. Lançamentos, eventos e 
              atualizações.
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-8 md:overflow-visible md:mx-0 md:px-0">
            {displayNews.map((news, index) => (
              <NewsCard 
                key={news.id}
                news={news}
                index={index}
                className="min-w-[300px] snap-start flex-shrink-0 md:min-w-0"
              />
            ))}
          </div>
          
          <div className="mt-8 text-center md:mt-12">
            <Button 
              size="lg" 
              className="bg-[#107C10] hover:bg-[#0D5A0D] text-white font-bold px-6 py-3 h-12 text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#107C10]/30 md:px-8 md:py-6 md:text-lg md:h-auto"
            >
              VER TODAS AS NOTÍCIAS <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Ofertas Especiais Section */}
      <section className="py-8 bg-gray-900 relative overflow-hidden md:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQ9Ik0zMCAwTDYwIDMwIDMwIDYwIDAgMzB6IiBmaWxsPSIjMTA3QzEwIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+\')] opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-6 md:mb-16"
          >
            <h2 className="text-2xl font-black mb-2 leading-tight tracking-tight md:text-6xl md:mb-4">
              OFERTAS <span className="text-[#107C10]">ESPECIAIS</span>
            </h2>
            <p className="text-sm text-gray-300 max-w-3xl mx-auto leading-normal px-4 md:text-xl md:px-0">
              Não perca as melhores promoções em consoles, jogos e acessórios Xbox. 
              Aproveite por tempo limitado!
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-4 -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-8 md:overflow-visible md:mx-0 md:px-0">
            {displayProducts.deals.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                variant="deal"
                className="min-w-[280px] snap-start flex-shrink-0 md:min-w-0"
              />
            ))}
          </div>
          
          <div className="mt-8 text-center md:mt-12">
            <Button 
              size="lg" 
              className="bg-[#107C10] hover:bg-[#0D5A0D] text-white font-bold px-6 py-3 h-12 text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#107C10]/30 md:px-8 md:py-6 md:text-lg md:h-auto"
            >
              VER TODAS AS OFERTAS <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col items-center justify-center mb-6 gap-y-4">
              <div className="flex items-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg" 
                  alt="Xbox Logo" 
                  className="h-6 mr-2 md:h-10 md:mr-2" 
                />
                <span className="text-lg font-bold text-white mr-2 md:text-2xl">×</span>
                <span className="text-lg font-bold text-white md:text-2xl">UTI DOS GAMES</span>
              </div>
              
              <p className="text-xs text-gray-400 mb-4 px-4 leading-relaxed md:text-sm md:px-0">
                Seu destino final para tudo relacionado a Xbox. Os melhores consoles, jogos e acessórios com as melhores ofertas.
              </p>
            </div>
            <div className="flex flex-col gap-y-6 mb-6 md:flex-row md:justify-center md:space-y-0 md:space-x-8">
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Institucional</span>
                <a href="#" className="text-xs text-gray-400 hover:text-[#107C10] transition-colors duration-300 py-2 md:text-sm md:py-0">Sobre Nós</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#107C10] transition-colors duration-300 py-2 md:text-sm md:py-0">Carreiras</a>
              </div>
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Suporte</span>
                <a href="#" className="text-xs text-gray-400 hover:text-[#107C10] transition-colors duration-300 py-2 md:text-sm md:py-0">FAQ</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#107C10] transition-colors duration-300 py-2 md:text-sm md:py-0">Contato</a>
              </div>
              <div className="flex flex-col gap-y-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Legal</span>
                <a href="#" className="text-xs text-gray-400 hover:text-[#107C10] transition-colors duration-300 py-2 md:text-sm md:py-0">Termos de Serviço</a>
                <a href="#" className="text-xs text-gray-400 hover:text-[#107C10] transition-colors duration-300 py-2 md:text-sm md:py-0">Política de Privacidade</a>
              </div>
            </div>
            <p className="text-xs text-gray-400 px-4 leading-relaxed">
              © 2025 UTI dos Games. Todos os direitos reservados.
              Xbox é uma marca registrada da Microsoft Corporation.
            </p>
          </motion.div>
        </div>
      </footer>

      {/* Componentes modais */}
      <Cart
        showCart={showCart}
        setShowCart={setShowCart}
      />
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default XboxPage4;
