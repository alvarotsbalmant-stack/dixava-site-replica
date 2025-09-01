import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/hooks/useProducts';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import FavoriteButton from '@/components/FavoriteButton';
import ProductCardImage from '@/components/ProductCard/ProductCardImage';
import ProductCardInfo from '@/components/ProductCard/ProductCardInfo';
import ProductCardPrice from '@/components/ProductCard/ProductCardPrice';
import ProductCardBadge from '@/components/ProductCard/ProductCardBadge';
import SectionTitle from '@/components/SectionTitle';

interface RelatedProductsMobileProps {
  product: Product;
}

const RelatedProductsMobile: React.FC<RelatedProductsMobileProps> = ({ product }) => {
  const navigate = useNavigate();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Buscar produtos relacionados baseados na categoria ou tags similares
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .neq('id', product.id)
          .eq('is_active', true)
          .limit(6);

        if (!error && data) {
          setRelatedProducts(data as Product[]);
        }
      } catch (err) {
        console.error('Erro ao buscar produtos relacionados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product.id]);

  if (loading) {
    return (
      <div className="bg-white p-4">
        <SectionTitle 
          title="Produtos relacionados"
          showViewAllButton={false}
          className="mb-4"
        />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4">
      <SectionTitle 
        title="Produtos relacionados"
        onViewAllClick={() => console.log('Ver todos produtos relacionados')}
        className="mb-4"
      />

      {/* Horizontal Scroll para mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {relatedProducts.map((relatedProduct) => (
          <Card
            key={relatedProduct.id}
            className="flex-shrink-0 w-40 h-64 relative flex flex-col bg-white overflow-hidden border border-gray-200 rounded-lg shadow-none transition-all duration-200 ease-in-out cursor-pointer p-0"
            onClick={() => navigate(`/produto/${relatedProduct.id}`)}
          >
            <ProductCardBadge 
              text={relatedProduct.badge_text || ''} 
              color={relatedProduct.badge_color || '#22c55e'} 
              isVisible={relatedProduct.badge_visible || false} 
            />

            {/* Favorite Button */}
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton productId={relatedProduct.id} size="sm" />
            </div>
            
            <ProductCardImage product={relatedProduct} isHovered={false} />

            <div className="flex flex-1 flex-col justify-between p-3">
              <div className="space-y-2">
                <ProductCardInfo product={relatedProduct} />
                <ProductCardPrice product={relatedProduct} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="flex justify-center mt-4 gap-1">
        {[...Array(Math.ceil(relatedProducts.length / 2))].map((_, i) => (
          <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProductsMobile;