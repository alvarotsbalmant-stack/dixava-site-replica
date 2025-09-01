
import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/hooks/useProducts';
import { useUTIProPricing } from '@/hooks/useUTIProPricing';
import { formatPrice } from '@/utils/formatPrice';
import { cn } from '@/lib/utils';

interface ProductCardPriceProps {
  product: Product;
  variant?: "default" | "game" | "accessory" | "deal";
  className?: string;
}

const ProductCardPrice = ({ product, variant = "default", className }: ProductCardPriceProps) => {
  const isGame = variant === "game";
  const utiProPricing = useUTIProPricing(product);
  
  return (
    <div className={cn(
      "flex flex-col gap-1",
      // Padding reduzido no mobile, normal no desktop
      "py-0.5 md:py-2",
      className
    )}>
      {/* Preço principal */}
      <div className="flex items-center justify-between">
        <motion.div 
          className={cn(
            "font-black text-[#107C10]",
            // Tamanho da fonte responsivo
            "text-sm md:text-xl",
            // Altura mínima reduzida no mobile
            "min-h-[14px] md:min-h-[24px] flex items-center"
          )}
          whileHover={{ 
            scale: 1.05,
            textShadow: "0 0 8px rgba(16, 124, 16, 0.8)",
            transition: { duration: 0.15 }
          }}
        >
          {formatPrice(product.price || 0)}
        </motion.div>
        {product.list_price && product.list_price > product.price && (
          <div className="text-xs text-gray-400 line-through">
            {formatPrice(product.list_price)}
          </div>
        )}
      </div>

      {/* Preço UTI Pro - só mostra se habilitado */}
      {utiProPricing.isEnabled && utiProPricing.proPrice && (
        <div className="text-xs text-yellow-400 font-semibold">
          {formatPrice(utiProPricing.proPrice)} com Pro
        </div>
      )}
    </div>
  );
};

export default ProductCardPrice;
