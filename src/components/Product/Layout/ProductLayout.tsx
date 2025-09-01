import React from 'react';
import { Product } from '@/hooks/useProducts';
import { SKUNavigation } from '@/hooks/useProducts/types';
import { cn } from '@/lib/utils';
import ProductMainContent from './ProductMainContent';
import ProductSidebar from './ProductSidebar';

interface ProductLayoutProps {
  product: Product;
  skuNavigation?: SKUNavigation;
  onAddToCart: (product: Product) => void;
  className?: string;
}

const ProductLayout: React.FC<ProductLayoutProps> = ({
  product,
  skuNavigation,
  onAddToCart,
  className
}) => {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 py-6", className)}>
      {/* Layout principal: 2 colunas + sidebar separada - CENTRALIZADO */}
      <div className="flex flex-col lg:flex-row gap-6 justify-center items-start mx-auto max-w-6xl">
        
        {/* Container da imagem e galeria + seções inferiores */}
        <div className="flex-1 max-w-4xl">
          {/* Top: Layout das 2 colunas superiores */}
          <div className="flex flex-col lg:flex-row gap-6 justify-center">
            
            {/* COLUNA 1: Container da Imagem Principal + Galeria UNIFICADOS */}
            <div className="w-full lg:w-[480px] order-1 lg:order-1">
              {/* STICKY REMOVIDO - scroll normal para melhor performance */}
              <div>
                <ProductMainContent 
                  product={product}
                  skuNavigation={skuNavigation}
                  layout="main-image"
                />
                
                {/* Galeria Horizontal centralizada - sempre abaixo da imagem */}
                <div className="mt-4 flex justify-center">
                  <ProductMainContent 
                    product={product}
                    skuNavigation={skuNavigation}
                    layout="gallery-horizontal"
                  />
                </div>
              </div>
            </div>

            {/* COLUNA 2: Informações do Produto - LARGURA CONTROLADA */}
            <div className="w-full lg:w-96 order-2" id="product-info-column">
              <ProductMainContent 
                product={product}
                skuNavigation={skuNavigation}
                layout="product-info"
              />
            </div>
          </div>

          {/* Seções inferiores - EXPANDIDAS para ocupar largura das duas colunas */}
          <div className="mt-12">
            {/* Desktop: expande da ponta esquerda da coluna 1 até ponta direita da coluna 2 */}
            <div className="hidden lg:flex lg:gap-6 justify-center">
              {/* Container expandido - largura das duas colunas principais (480px + 384px + gap) */}
              <div className="w-full max-w-[900px]">
                <ProductMainContent 
                  product={product}
                  skuNavigation={skuNavigation}
                  layout="bottom-sections"
                />
              </div>
            </div>
            
            {/* Mobile: largura total */}
            <div className="block lg:hidden">
              <ProductMainContent 
                product={product}
                skuNavigation={skuNavigation}
                layout="bottom-sections"
              />
            </div>
          </div>
        </div>

        {/* COLUNA 4: Sidebar de Compra - STICKY independente, ao lado do conteúdo */}
        <div className="w-full lg:w-80 order-4 flex-shrink-0">
          <div className="sticky top-4 z-10">
            <ProductSidebar
              product={product}
              skuNavigation={skuNavigation}
              onAddToCart={onAddToCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductLayout;

