import React from 'react';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Keep for potential subtle tags

interface ProductInfoProps {
  product: Product;
}

// **Radical Redesign based on GameStop reference and plan_transformacao_radical.md**
const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  // Determine primary platform tag if available (subtle display)
  const platformTag = product.tags?.find(tag =>
    ['playstation', 'xbox', 'nintendo', 'pc'].some(platform => tag.name.toLowerCase().includes(platform))
  )?.name;

  return (
    <div className="space-y-2"> {/* Add some spacing between elements */}
      {/* Optional: Platform Tag (Subtle) */}
      {platformTag && (
        <Badge variant="outline" className="text-xs font-medium border-border/70 bg-secondary/50 text-secondary-foreground">
          {platformTag}
        </Badge>
      )}

      {/* Product Title - Main focus */}
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
        {product.name}
      </h1>

      {/* Optional: Developer/Publisher Info (if available and desired) */}
      {/* Example:
      {product.developer && (
        <p className="text-sm text-muted-foreground">Desenvolvido por: {product.developer}</p>
      )}
      */}

      {/* Ratings and extensive tags are omitted here for a cleaner look, similar to GameStop's main info block */}
    </div>
  );
};

export default ProductInfo;

