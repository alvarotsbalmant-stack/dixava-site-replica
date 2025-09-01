
import React from 'react';
import { useIndexPage } from '@/hooks/useIndexPage';
import { useCart } from '@/contexts/CartContext';
import HomePageContent from '@/components/HomePage/HomePageContent';
import LoadingState from '@/components/HomePage/LoadingState';
import ErrorState from '@/components/HomePage/ErrorState';

const HomePage = () => {
  const {
    products,
    productsLoading,
    layoutItems,
    sections,
    bannerData,
    isLoading,
    showErrorState,
    sectionsLoading,
    handleRetryProducts
  } = useIndexPage();

  const { addToCart } = useCart();

  const handleAddToCart = (product: any, size?: string, color?: string) => {
    addToCart(product, size, color);
  };

  if (showErrorState) {
    return <ErrorState onRetry={handleRetryProducts} />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* DIAGNÓSTICO: Link direto para teste */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999, background: 'red', color: 'white', padding: '10px' }}>
        <a href="/produto/737a4bca-540d-4c55-9296-47e0496177fb" style={{ color: 'white', textDecoration: 'none' }}>
          🔍 TESTE PRODUTO
        </a>
      </div>
      
      <HomePageContent
        layoutItems={layoutItems}
        products={products}
        sections={sections}
        bannerData={bannerData}
        isLoading={isLoading}
        showErrorState={showErrorState}
        productsLoading={productsLoading}
        sectionsLoading={sectionsLoading}
        onAddToCart={handleAddToCart}
        onRetryProducts={handleRetryProducts}
      />
    </div>
  );
};

export default HomePage;
