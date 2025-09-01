
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/contexts/AnalyticsContext';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  className = '',
  size = 'md'
}) => {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isAddingToFavorites, isRemovingFromFavorites } = useFavorites();
  const { trackEvent } = useAnalytics();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasAlreadyFavorite = isFavorite(productId);
    
    // Track analytics event
    trackEvent(wasAlreadyFavorite ? 'remove_from_favorites' : 'add_to_favorites', {
      product_id: productId
    }, productId);
    
    await toggleFavorite(productId);
  };

  const isLoading = isAddingToFavorites || isRemovingFromFavorites;
  const isFavorited = isFavorite(productId);

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-10 w-10';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`${getButtonSize()} rounded-full bg-white/80 hover:bg-white shadow-sm transition-all duration-200 ${className}`}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart
        className={`${getIconSize()} transition-all duration-200 ${
          isFavorited
            ? 'fill-red-500 text-red-500'
            : 'text-gray-600 hover:text-red-500'
        } ${isLoading ? 'animate-pulse' : ''}`}
      />
    </Button>
  );
};

export default FavoriteButton;
