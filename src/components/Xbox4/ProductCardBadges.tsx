
import React from 'react';
import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';

interface ProductCardBadgesProps {
  product: Product;
  variant?: "default" | "game" | "accessory" | "deal";
}

const ProductCardBadges = ({ product, variant = "default" }: ProductCardBadgesProps) => {
  const isDeal = variant === "deal";
  
  // Calculate discount if there's a list_price
  const hasDiscount = product.list_price && product.list_price > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.list_price! - product.price) / product.list_price!) * 100) : 0;
  
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
      {product.is_featured && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.15 }}
        >
          <Badge className="bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg">
            DESTAQUE
          </Badge>
        </motion.div>
      )}
      {product.badge_visible && product.badge_text && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.15 }}
        >
          <Badge className="bg-red-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">
            {product.badge_text}
          </Badge>
        </motion.div>
      )}
      {isDeal && hasDiscount && (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1 }}
          className="bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
        >
          <Tag size={12} />
          {discountPercent}% OFF
        </motion.div>
      )}
    </div>
  );
};

export default ProductCardBadges;
