// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Loader2, Zap, Play, ChevronRight, Gamepad2, Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import Cart from '@/components/Cart';
import { AuthModal } from '@/components/Auth/AuthModal';

// Componente de cartão de produto otimizado para PlayStation V4
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
          <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            -{product.discount}%
          </div>
        )}
        {product.isNew && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-[#003791] to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            NOVO
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            DESTAQUE
          </div>
        )}
      </div>
      
      <div className="p-4 md:p-6 flex flex-col justify-between flex-grow">
        <div className="min-h-[60px] mb-3">
          <h3 className="font-medium text-gray-900 text-sm md:text-base leading-tight tracking-tight line-clamp-2 mb-2">{product.name}</h3>
          {product.rating && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg md:text-2xl font-bold text-[#003791]">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <div className="text-xs md:text-sm text-gray-500 line-through font-medium">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </div>
              )}
            </div>
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
              {product.category}
            </span>
          </div>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            className="w-full bg-gradient-to-r from-[#003791] to-blue-700 hover:from-blue-700 hover:to-[#003791] text-white font-bold py-2 md:py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm md:text-base"
          >
            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const PlayStationPageProfessionalV4 = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
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

  // Dados dos produtos PlayStation
  const playstationProducts = {
    consoles: [
      {
        id: 'ps5-console',
        name: 'PlayStation 5',
        price: 4199.99,
        originalPrice: 4699.99,
        discount: 11,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=400&fit=crop&crop=center',
        isFeatured: true,
        category: 'Console'
      },
      {
        id: 'ps5-digital',
        name: 'PlayStation 5 Digital Edition',
        price: 3599.99,
        originalPrice: 3999.99,
        discount: 10,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1622297845775-5ff3fef71d13?w=600&h=400&fit=crop&crop=center',
        category: 'Console'
      },
      {
        id: 'ps4-pro',
        name: 'PlayStation 4 Pro',
        price: 2499.99,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=600&h=400&fit=crop&crop=center',
        category: 'Console'
      }
    ],
    games: [
      {
        id: 'spiderman-2',
        name: 'Marvel\'s Spider-Man 2',
        price: 349.99,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop&crop=center',
        category: 'Jogo',
        isNew: true
      },
      {
        id: 'god-of-war',
        name: 'God of War Ragnarök',
        price: 299.99,
        originalPrice: 349.99,
        discount: 14,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=600&h=400&fit=crop&crop=center',
        category: 'Jogo'
      },
      {
        id: 'horizon',
        name: 'Horizon Forbidden West',
        price: 249.99,
        originalPrice: 299.99,
        discount: 17,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop&crop=center',
        category: 'Jogo'
      },
      {
        id: 'tlou',
        name: 'The Last of Us Part II',
        price: 199.99,
        rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop&crop=center',
        category: 'Jogo'
      }
    ],
    accessories: [
      {
        id: 'dualsense',
        name: 'Controle DualSense',
        price: 449.99,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop&crop=center',
        category: 'Acessório',
        isNew: true
      },
      {
        id: 'pulse-3d',
        name: 'Headset PULSE 3D',
        price: 599.99,
        originalPrice: 699.99,
        discount: 14,
        rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop&crop=center',
        category: 'Acessório'
      },
      {
        id: 'hd-camera',
        name: 'HD Camera',
        price: 299.99,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1589652717521-10c0d092dea9?w=600&h=400&fit=crop&crop=center',
        category: 'Acessório'
      }
    ]
  };

  useEffect(() => {
    document.title = 'PlayStation | UTI dos Games - Consoles, Jogos e Acessórios';
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCartOpen = () => {
    setShowCart(true);
  };

  const handleAuthOpen = () => {
    setShowAuthModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#003791] to-[#003791] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white needs-desktop-spacing">
      <ProfessionalHeader onCartOpen={handleCartOpen} onAuthOpen={handleAuthOpen} />
      
      {/* Hero Banner - Otimizado para mobile */}
      <section 
        ref={heroRef}
        className="relative py-20 md:py-32 lg:py-40 bg-gradient-to-br from-[#003791] via-[#0041a3] to-[#003791] overflow-hidden flex items-center justify-center"
      >
        {/* Efeitos visuais de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 md:top-20 left-5 md:left-10 text-white/5 text-4xl md:text-8xl animate-pulse">○</div>
          <div className="absolute top-20 md:top-40 right-10 md:right-20 text-white/5 text-6xl md:text-12xl animate-bounce">□</div>
          <div className="absolute bottom-16 md:bottom-32 left-10 md:left-20 text-white/5 text-5xl md:text-10xl animate-pulse">△</div>
          <div className="absolute bottom-10 md:bottom-20 right-5 md:right-10 text-white/5 text-4xl md:text-8xl animate-bounce">✕</div>
          
          {/* Gradiente adicional para profundidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>
        
        {/* Conteúdo do hero */}
        <div className="container mx-auto px-4 md:px-6 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl text-center text-white"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-6xl lg:text-8xl font-light mb-6 md:mb-8 leading-tight tracking-tight"
            >
              PLAY HAS NO <br />
              <span className="text-blue-300 font-medium">LIMITS</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base md:text-xl lg:text-2xl text-blue-100 mb-8 md:mb-12 max-w-3xl mx-auto font-light tracking-tight leading-relaxed px-4"
            >
              Experimente o carregamento ultrarrápido, imersão mais profunda e uma nova 
              geração de jogos incríveis no PlayStation 5
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-4"
            >
              <Button 
                size="lg" 
                className="bg-white text-[#003791] hover:bg-blue-50 font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                EXPLORAR PS5
              </Button>
              <Button 
                size="lg" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#003791] font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded-2xl transition-all duration-300 shadow-xl"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                VER JOGOS
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PlayStation 5 Consoles - Layout otimizado */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6 tracking-tight">
              PlayStation<span className="text-[#003791] font-medium">®5</span> Consoles
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-4xl mx-auto font-light tracking-tight leading-relaxed px-4">
              O console PS5™ libera novas possibilidades de jogo que você nunca imaginou. 
              Experimente carregamento ultrarrápido, imersão mais profunda e uma nova geração de jogos incríveis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {playstationProducts.consoles.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Exclusivos PlayStation - Design otimizado */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-gray-900 via-[#003791] to-gray-900 text-white relative overflow-hidden">
        {/* Efeitos de fundo */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-light mb-4 md:mb-6 tracking-tight">
              Exclusivos <span className="text-blue-400 font-medium">PlayStation</span>
            </h2>
            <p className="text-base md:text-xl text-blue-200 max-w-4xl mx-auto font-light tracking-tight leading-relaxed px-4">
              Descubra os jogos que definem uma geração, disponíveis apenas no ecossistema PlayStation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {playstationProducts.games.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Acessórios PlayStation - Layout otimizado */}
      <section className="py-16 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl lg:text-6xl font-light text-gray-900 mb-4 md:mb-6 tracking-tight">
              Acessórios <span className="text-[#003791] font-medium">Oficiais</span>
            </h2>
            <p className="text-base md:text-xl text-gray-600 max-w-4xl mx-auto font-light tracking-tight leading-relaxed px-4">
              Construa sua configuração de jogo perfeita com controles, headsets e outros acessórios 
              para seu console PS5™
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto">
            {playstationProducts.accessories.map((product, index) => (
              <ProductCard 
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PlayStation Plus - Seção otimizada */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-[#003791] to-[#0041a3] text-white relative overflow-hidden">
        {/* Efeitos visuais */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-36 md:w-72 h-36 md:h-72 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-36 md:w-72 h-36 md:h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-4xl lg:text-6xl font-light mb-6 md:mb-8 tracking-tight">
                PlayStation <span className="text-yellow-300 font-medium">Plus</span>
              </h2>
              <p className="text-base md:text-xl mb-6 md:mb-8 font-light tracking-tight leading-relaxed">
                Aproveite centenas de jogos de PS5, PS4 e clássicos, modo multijogador online, 
                descontos exclusivos e benefícios imperdíveis com três planos de grande valor.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-[#003791] hover:bg-blue-50 font-bold px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                ASSINAR AGORA
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/20">
                <div className="text-center">
                  <div className="text-4xl md:text-6xl mb-4">🎮</div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4">Benefícios Exclusivos</h3>
                  <ul className="text-left space-y-3 text-base md:text-lg">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></span>
                      Jogos mensais gratuitos
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></span>
                      Multijogador online
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></span>
                      Descontos exclusivos
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></span>
                      Armazenamento na nuvem
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-gray-400 text-sm md:text-base">© 2025 UTI dos Games. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Modais */}
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default PlayStationPageProfessionalV4;

