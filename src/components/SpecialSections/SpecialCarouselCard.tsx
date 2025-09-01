import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';

interface SpecialCarouselCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    platform?: string;
    isOnSale?: boolean;
    discount?: number;
  };
  onCardClick?: (productId: string) => void;
}

const SpecialCarouselCard: React.FC<SpecialCarouselCardProps> = ({
  product,
  onCardClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(product.id);
    }
  };

  return (
    <motion.div
      className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer flex-shrink-0 shadow-none transition-all duration-200 ease-in-out w-[170px] min-w-[170px] h-[272px] min-h-[272px] md:w-[200px] md:min-w-[200px] md:h-[320px] md:min-h-[320px]"
      whileHover={{ y: -4, boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sale Badge */}
      {product.isOnSale && product.discount && (
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </span>
        </div>
      )}

      {/* Favorite Button */}
      <div className="absolute top-2 right-2 z-10">
        <FavoriteButton productId={product.id} size="sm" />
      </div>

      {/* Product Image - CORRIGIDO PARA USAR object-contain COMO NAS SEÇÕES NORMAIS */}
      <div className="relative bg-white overflow-hidden flex items-center justify-center h-[170px] md:h-[200px]">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-contain p-2 transition-transform duration-300 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '200px 200px'
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col justify-between h-[102px] md:h-[120px]">
        <div>
          <h3 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Platform */}
          {product.platform && (
            <p className="text-xs md:text-xs text-gray-500 mb-1 md:mb-2">{product.platform}</p>
          )}

          {/* Price */}
          <div className="flex flex-col gap-1">
            {product.originalPrice && product.originalPrice > product.price ? (
              <>
                <span className="text-xs md:text-xs text-gray-400 line-through">
                  R${product.originalPrice.toFixed(2)}
                </span>
                <span className="text-xs md:text-sm font-bold text-red-600">
                  R${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-xs md:text-sm font-bold text-gray-900">
                R${product.price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpecialCarouselCard;

