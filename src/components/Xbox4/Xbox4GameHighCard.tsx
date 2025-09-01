import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Product } from '@/hooks/useProducts';
import { ProductImage } from '@/components/OptimizedImage/ProductImage';

interface Xbox4GameHighCardProps {
  game: Product;
  onGameClick: (gameId: string) => void;
  index?: number;
  className?: string;
}

const Xbox4GameHighCard = ({ game, onGameClick, index = 0, className }: Xbox4GameHighCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.1 } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      className={cn(
        "flex flex-col items-center cursor-pointer",
        "w-[160px] md:w-[200px]", // Adjust width as needed
        "mx-2", // Add horizontal margin for spacing
        className
      )}
      onClick={() => onGameClick(game.id)}
    >
      {/* Image container */}
      <ProductImage
        src={game.image}
        alt={game.name}
        variant="detail"
        className="w-full aspect-[3/4]"
        priority={index < 3} // Primeiras 3 imagens têm prioridade
      />
      {/* Title below the image */}
      <p className="mt-2 text-sm md:text-base text-white text-center font-semibold">
        {game.name}
      </p>
    </motion.div>
  );
};

export default Xbox4GameHighCard;


