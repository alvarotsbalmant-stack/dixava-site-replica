import React from 'react';

interface ProductCardBadgeProps {
  text: string;
  color: string;
  isVisible: boolean;
}

const ProductCardBadge: React.FC<ProductCardBadgeProps> = ({ text, color, isVisible }) => {
  if (!isVisible || !text) {
    return null;
  }

  return (
    <div 
      className="absolute top-1.5 md:top-2 left-1.5 md:left-2 z-10 px-1.5 md:px-2 py-0.5 md:py-1 text-xs font-bold text-white uppercase tracking-wide rounded-sm shadow-md"
      style={{ backgroundColor: color }}
    >
      {text}
    </div>
  );
};

export default ProductCardBadge;

