import React from 'react';
import { Product } from '@/hooks/useProducts';
import { Separator } from '@/components/ui/separator';
import { sanitizeHtml } from '@/lib/sanitizer';

interface ProductDescriptionProps {
  product: Product;
}

// **New Component - Basic Structure based on GameStop reference**
const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  // Use product.description or a specific field for detailed description
  const descriptionHtml = product.description || '<p>Nenhuma descrição detalhada disponível para este produto.</p>';

  return (
    <div className="space-y-4">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground border-b border-border pb-2 mb-4">
        Descrição do Produto
      </h2>
      {/* Render HTML content safely or use a markdown parser if description is in markdown */}
      <div 
        className="prose prose-sm sm:prose-base max-w-none text-muted-foreground" 
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(descriptionHtml) }}
      />
      {/* Add Features section if applicable, similar to GameStop */}
      {/* Example:
      {product.features && product.features.length > 0 && (
        <>
          <Separator className="my-6" />
          <h3 className="text-lg font-semibold text-foreground mb-3">Recursos</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {product.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </>
      )}
      */}
    </div>
  );
};

export default ProductDescription;

