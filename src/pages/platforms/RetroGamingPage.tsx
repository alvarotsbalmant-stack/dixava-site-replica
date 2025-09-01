import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import CustomPlatformPage from '@/components/Platform/CustomPlatformPage';
import { customPlatformPages } from '@/data/customPlatformPages';
import PlatformPageNotFound from '@/components/PlatformPage/PlatformPageNotFound';

const RetroGamingPage: React.FC = () => {
  const { products } = useProducts();
  const { addToCart } = useCart();

  const pageData = customPlatformPages.find(page => page.slug === 'retro-gaming');

  if (!pageData) {
    return <PlatformPageNotFound />;
  }

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleProductCardClick = (productId: string) => {
    console.log(`Product ${productId} clicked`);
  };

  return (
    <CustomPlatformPage
      pageData={pageData}
      products={products}
      onAddToCart={handleAddToCart}
      onProductClick={handleProductCardClick}
    />
  );
};

export default RetroGamingPage;


