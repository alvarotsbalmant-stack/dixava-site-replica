import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalization } from '@/hooks/usePersonalization';
import { PersonalizedGreeting } from './PersonalizedGreeting';
import { RecommendationCard } from './RecommendationCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Target } from 'lucide-react';

interface PersonalizedSectionProps {
  className?: string;
}

export const PersonalizedSection: React.FC<PersonalizedSectionProps> = ({ 
  className = '' 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    topRecommendations, 
    personalizationData,
    trackUserAction,
    getPersonalizedBannerMessage 
  } = usePersonalization();

  if (!user) return null;

  const handleViewProduct = (productId: string) => {
    trackUserAction('view_product', { productId, source: 'personalized_recommendations' });
    // Navegar para página do produto
    navigate(`/produto/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    trackUserAction('add_to_cart', { productId, source: 'personalized_recommendations' });
    // Lógica de adicionar ao carrinho
    console.log('Adding to cart:', productId);
  };

  const handleAddToWishlist = (productId: string) => {
    trackUserAction('add_to_wishlist', { productId, source: 'personalized_recommendations' });
    // Lógica de adicionar à wishlist
    console.log('Adding to wishlist:', productId);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Personalized Greeting */}
      <PersonalizedGreeting />

      {/* Personalized Banner Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-6 text-white"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Oferta Especial Para Você</h3>
              <p className="text-blue-100">{getPersonalizedBannerMessage()}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
            Ver Ofertas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
      </motion.div>

      {/* Recommendations Section */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Recomendado Para Você
              </h2>
              <p className="text-slate-600 text-sm">
                Baseado no seu perfil e preferências
              </p>
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            Ver Todas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topRecommendations.slice(0, 4).map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              index={index}
              onView={handleViewProduct}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          ))}
        </div>

        {/* User Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
        >
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {personalizationData.favoriteCategories.length}
            </div>
            <div className="text-sm text-slate-600">Categorias Favoritas</div>
            <div className="text-xs text-slate-500 mt-1">
              {personalizationData.favoriteCategories.slice(0, 2).join(', ')}
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {personalizationData.preferredPlatforms.length}
            </div>
            <div className="text-sm text-slate-600">Plataformas Preferidas</div>
            <div className="text-xs text-slate-500 mt-1">
              {personalizationData.preferredPlatforms.slice(0, 2).join(', ')}
            </div>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-slate-800 mb-1">
              R$ {personalizationData.priceRange.min}-{personalizationData.priceRange.max}
            </div>
            <div className="text-sm text-slate-600">Faixa de Preço</div>
            <div className="text-xs text-slate-500 mt-1">
              Baseado no seu histórico
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

