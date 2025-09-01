import React from 'react';
import { Recommendation } from '@/types/retention';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, TrendingUp } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  index?: number;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
  onView?: (productId: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  index = 0,
  onAddToCart,
  onAddToWishlist,
  onView
}) => {
  const { getConfidenceColor } = usePersonalization();

  const handleCardClick = () => {
    onView?.(recommendation.productId);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(recommendation.productId);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWishlist?.(recommendation.productId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Confidence Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge 
          variant="secondary" 
          className={`text-xs px-2 py-1 ${getConfidenceColor(recommendation.confidence)}`}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          {recommendation.confidence}%
        </Badge>
      </div>

      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
        <img
          src={recommendation.imageUrl}
          alt={recommendation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        
        {/* Quick actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1 bg-white/90 hover:bg-white text-slate-800"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Comprar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-slate-800 px-3"
            onClick={handleAddToWishlist}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Badge variant="outline" className="text-xs">
          {recommendation.category}
        </Badge>

        {/* Title */}
        <h3 className="font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {recommendation.title}
        </h3>

        {/* Recommendation Reason */}
        <div className="flex items-start gap-2">
          <Star className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            {recommendation.reason}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-slate-800">
            R$ {recommendation.price.toFixed(2).replace('.', ',')}
          </div>
          
          {/* Quick add to cart button */}
          <Button
            size="sm"
            variant="outline"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-300 pointer-events-none" />
    </motion.div>
  );
};

