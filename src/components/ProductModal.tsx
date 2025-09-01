import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/hooks/useProducts/types';
import ProductCard from './ProductCard';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onOpenChange }) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <ProductCard
            product={product}
            onCardClick={() => {}}
            onAddToCart={() => {}}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;