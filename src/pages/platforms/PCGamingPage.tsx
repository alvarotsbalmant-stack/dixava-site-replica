import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import CustomPlatformPage from '@/components/Platform/CustomPlatformPage';
import { customPlatformPages } from '@/data/customPlatformPages';
import PlatformPageLoading from '@/components/PlatformPage/PlatformPageLoading';
import PlatformPageNotFound from '@/components/PlatformPage/PlatformPageNotFound';

const PCGamingPage: React.FC = () => {
  const { products } = useProducts();
  const { addToCart } = useCart();

  const pageData = customPlatformPages.find(page => page.slug === 'pc-gaming');

  if (!pageData) {
    return <PlatformPageNotFound />;
  }

  // Wrapper function to adapt addToCart signature for CustomPlatformPage
  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  // Placeholder for product click handler
  const handleProductCardClick = (productId: string) => {
    console.log(`Product ${productId} clicked`);
    // Implement navigation to product detail page if needed
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

export default PCGamingPage;


