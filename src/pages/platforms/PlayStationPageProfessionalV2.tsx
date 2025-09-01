// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Loader2, Zap, Play, ChevronRight, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';
import Cart from '@/components/Cart';
import { AuthModal } from '@/components/Auth/AuthModal';

// Componente de cartão de produto isolado para PlayStation
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
      className="bg-white rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.01] hover:shadow-lg flex flex-col h-full" // Changed hover:shadow-xl to hover:shadow-lg and added hover:scale-[1.01]
      onClick={() => handleProductClick(product.id)}
    >
      <div className="relative overflow-hidden bg-gray-100 aspect-[3/4]">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div className="min-h-[48px] mb-2">
          <h3 className="font-light text-gray-800 text-sm leading-tight tracking-tight line-clamp-2">{product.name}</h3>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-2xl font-light text-[#003791]">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.originalPrice && (
              <div className="text-sm text-gray-500 line-through font-light tracking-tight">
                R$ {product.originalPrice.toFixed(2).replace('.', ',')}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-light tracking-tight">
            {product.category}
          </span>
        </div>
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(product);
          }}
          className="w-full bg-[#003791] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 mt-4"
          style={{ backgroundColor: '#003791' }} // Cor específica do PlayStation
        >
          <Gamepad2 className="w-4 h-4 mr-2" />
          Adicionar ao Carrinho
        </Button>
      </div>
    </motion.div>
  );
};

const PlayStationPageProfessionalV2 = () => {
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
      
      {/* Hero Banner */}
      <section 
        ref={heroRef}
        className="relative py-24 md:py-32 bg-gradient-to-br from-[#003791] via-[#003791] to-[#003791] overflow-hidden flex items-center justify-center"
      >
        {/* Símbolos PlayStation animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 text-white/10 text-6xl animate-pulse">○</div>
          <div className="absolute top-40 right-20 text-white/10 text-8xl animate-bounce">□</div>
          <div className="absolute bottom-32 left-20 text-white/10 text-7xl animate-pulse">△</div>
          <div className="absolute bottom-20 right-10 text-white/10 text-6xl animate-bounce">✕</div>
        </div>
        
        {/* Conteúdo do hero */}
        <div className="container mx-auto px-4 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl text-center text-white"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-7xl font-light mb-6 leading-tight tracking-tight"
            >
              PLAY HAS NO <br />
              <span className="text-blue-300">LIMITS</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto font-light tracking-tight"
            >
              Experimente o carregamento ultrarrápido, imersão mais profunda e uma nova 
              geração de jogos incríveis
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="bg-white text-[#003791] hover:bg-blue-50 font-bold px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: 'white', color: '#003791' }} // Cores específicas do PlayStation
              >
                <Zap className="w-5 h-5 mr-2" />
                EXPLORAR PS5
              </Button>
              <Button 
                size="lg" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#003791] font-bold px-8 py-4 text-lg rounded-lg transition-all duration-300"
                style={{ borderColor: 'white', color: 'white' }} // Cores específicas do PlayStation
              >
                <Play className="w-5 h-5 mr-2" />
                VER JOGOS
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PlayStation 5 Consoles */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-light text-gray-800 mb-4 tracking-tight">
              PlayStation<span className="text-[#003791]">®5</span> Consoles
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light tracking-tight">
              Experimente o carregamento ultrarrápido, imersão mais profunda e uma nova 
              geração de jogos incríveis
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-8 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:mx-0 md:px-0">
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

      {/* Exclusivos PlayStation */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-[#003791] text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-light mb-4 tracking-tight">
              Exclusivos <span className="text-blue-400">PlayStation</span>
            </h2>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto font-light tracking-tight">
              Descubra os jogos que definem uma geração, disponíveis apenas no ecossistema PlayStation
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-8 -mx-4 px-4 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible md:mx-0 md:px-0">
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

      {/* Acessórios PlayStation */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-light text-gray-800 mb-4 tracking-tight">
              Acessórios <span className="text-[#003791]">Oficiais</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light tracking-tight">
              Eleve sua experiência de jogo com acessórios projetados para maximizar suas sessões
            </p>
          </motion.div>

          <div className="flex overflow-x-auto snap-x snap-mandatory pb-4 gap-8 -mx-4 px-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:mx-0 md:px-0">
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

      {/* PlayStation Plus */}
      <section className="py-24 bg-gradient-to-br from-[#003791] to-[#003791] text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <h2 className="text-3xl md:text-5xl font-light mb-4 tracking-tight">
                PlayStation <span className="text-yellow-200">Plus</span>
              </h2>
              <p className="text-lg mb-6 font-light tracking-tight">
                Aproveite jogos mensais, multijogador online, descontos exclusivos e muito mais com o PlayStation Plus.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-[#003791] hover:bg-blue-50 font-bold px-8 py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: 'white', color: '#003791' }} // Cores específicas do PlayStation Plus
              >
                ASSINAR AGORA
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:w-1/2 flex justify-center"
            >
              <img 
                src="https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=400&fit=crop&crop=center" 
                alt="PlayStation Plus" 
                className="rounded-lg shadow-2xl max-w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-light tracking-tight">&copy; {new Date().getFullYear()} UTI dos Games. Todos os direitos reservados.</p>
        </div>
      </footer>

      <Cart showCart={showCart} setShowCart={setShowCart} />
      <AuthModal showAuthModal={showAuthModal} setShowAuthModal={setShowAuthModal} />
    </div>
  );
};

export default PlayStationPageProfessionalV2;


