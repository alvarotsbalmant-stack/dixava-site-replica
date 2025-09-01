import React from 'react';
import { Product } from '@/hooks/useProducts';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductRatingProps {
  product: Product;
  rating?: number;
  reviewCount?: number;
  className?: string;
}

const ProductRating: React.FC<ProductRatingProps> = ({ 
  product, 
  rating = 4.8, 
  reviewCount = 127,
  className 
}) => {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Estrelas */}
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-semibold text-gray-900">
          {rating}
        </span>
      </div>
      
      {/* Link para avaliações */}
      <button 
        className="text-sm text-blue-600 hover:underline transition-colors"
        onClick={() => {
          // Scroll para seção de avaliações
          const reviewsSection = document.getElementById('product-reviews');
          if (reviewsSection) {
            reviewsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        ({reviewCount} avaliações)
      </button>
    </div>
  );
};

export default ProductRating;

