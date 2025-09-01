
import React, { useState } from 'react';
import { Page, PageLayoutItem } from '@/hooks/usePages';
import { Product } from '@/hooks/useProducts';
import PlatformSectionRenderer from './PlatformSectionRenderer';
import ProfessionalHeader from '@/components/Header/ProfessionalHeader';

interface PlatformPageContentProps {
  page: Page;
  layout: PageLayoutItem[];
  products: Product[];
  onAddToCart: (product: Product) => void;
  isModalOpen: boolean;
  selectedProductId: string | null;
  setIsModalOpen: (open: boolean) => void;
  handleProductCardClick: (productId: string) => void;
}

const PlatformPageContent: React.FC<PlatformPageContentProps> = ({
  page,
  layout,
  products,
  onAddToCart,
  isModalOpen,
  selectedProductId,
  setIsModalOpen,
  handleProductCardClick
}) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleCartOpen = () => {
    console.log('[PlatformPageContent] Cart opened');
    setIsCartOpen(true);
  };

  const handleAuthOpen = () => {
    console.log('[PlatformPageContent] Auth modal opened');
    setIsAuthOpen(true);
  };

  const handleCartClose = () => {
    setIsCartOpen(false);
  };

  const handleAuthClose = () => {
    setIsAuthOpen(false);
  };

  // Find the selected product by ID
  const selectedProduct = selectedProductId 
    ? products.find(product => product.id === selectedProductId) || null 
    : null;

  return (
    <div className="min-h-screen bg-black pt-4 needs-desktop-spacing-large">
      <ProfessionalHeader 
        onCartOpen={handleCartOpen}
        onAuthOpen={handleAuthOpen}
      />

      <main>
        {layout.map((section) => (
          <PlatformSectionRenderer
            key={section.id}
            section={section}
            products={products}
            onAddToCart={onAddToCart}
            onProductClick={handleProductCardClick}
          />
        ))}
      </main>

      {/* Cart Modal - You may need to implement this component */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Carrinho de Compras</h2>
            <p className="text-gray-600 mb-4">Funcionalidade do carrinho será implementada.</p>
            <button 
              onClick={handleCartClose}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Auth Modal - You may need to implement this component */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Login / Cadastro</h2>
            <p className="text-gray-600 mb-4">Funcionalidade de autenticação será implementada.</p>
            <button 
              onClick={handleAuthClose}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformPageContent;
