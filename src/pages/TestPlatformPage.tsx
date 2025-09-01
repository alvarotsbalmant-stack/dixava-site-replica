import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductModal from '@/components/ProductModal';
import { Skeleton } from '@/components/ui/skeleton';
import HeroBanner from '@/components/HeroBanner';
import FeaturedProductsSection from '@/components/FeaturedProducts/FeaturedProductsSection';

// Componente para testar a funcionalidade das páginas de plataforma
const TestPlatformPage: React.FC = () => {
  const { products, loading: productsLoading } = useProducts();
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Filtrar produtos por plataforma para teste
  const xboxProducts = products.filter(product => 
    product.tags?.some(tag => 
      tag.name.toLowerCase().includes('xbox')
    )
  );
  
  const playstationProducts = products.filter(product => 
    product.tags?.some(tag => 
      tag.name.toLowerCase().includes('playstation') || 
      tag.name.toLowerCase().includes('ps5') || 
      tag.name.toLowerCase().includes('ps4')
    )
  );
  
  const nintendoProducts = products.filter(product => 
    product.tags?.some(tag => 
      tag.name.toLowerCase().includes('nintendo') || 
      tag.name.toLowerCase().includes('switch')
    )
  );
  
  // Função para abrir o modal de produto
  const handleProductCardClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };
  
  // Renderizar estado de carregamento
  if (productsLoading) {
    return (
      <>
        <Header />
        <main>
          <div className="container mx-auto py-8">
            <Skeleton className="h-64 w-full rounded-lg mb-8" />
            <Skeleton className="h-8 w-1/3 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main>
        <div className="space-y-8">
          {/* Teste da página Xbox */}
          <div style={{ '--primary-color': '#107C10' } as React.CSSProperties}>
            <HeroBanner
              title="Xbox Series X|S"
              subtitle="Poder Inigualável"
              imageUrl="/banners/xbox-hero.jpg"
              ctaText="Comprar Agora"
              ctaLink="/xbox"
              theme={{ primaryColor: '#107C10', secondaryColor: '#3A3A3A' }}
            />
            
            <FeaturedProductsSection
              products={xboxProducts.slice(0, 8)}
              loading={false}
              onAddToCart={addToCart}
              title="Destaques Xbox"
            />
          </div>
          
          {/* Teste da página PlayStation */}
          <div style={{ '--primary-color': '#0070D1' } as React.CSSProperties}>
            <HeroBanner
              title="PlayStation 5"
              subtitle="Jogue Sem Limites"
              imageUrl="/banners/playstation-hero.jpg"
              ctaText="Explorar"
              ctaLink="/playstation"
              theme={{ primaryColor: '#0070D1', secondaryColor: '#1F1F1F' }}
            />
            
            <FeaturedProductsSection
              products={playstationProducts.slice(0, 8)}
              loading={false}
              onAddToCart={addToCart}
              title="Destaques PlayStation"
            />
          </div>
          
          {/* Teste da página Nintendo */}
          <div style={{ '--primary-color': '#E60012' } as React.CSSProperties}>
            <HeroBanner
              title="Nintendo Switch"
              subtitle="Diversão Para Todos"
              imageUrl="/banners/nintendo-hero.jpg"
              ctaText="Descubra"
              ctaLink="/nintendo"
              theme={{ primaryColor: '#E60012', secondaryColor: '#FFFFFF' }}
            />
            
            <FeaturedProductsSection
              products={nintendoProducts.slice(0, 8)}
              loading={false}
              onAddToCart={addToCart}
              title="Destaques Nintendo"
            />
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Modal de produto */}
      <ProductModal
        product={products.find(p => p.id === selectedProductId) || null}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};

export default TestPlatformPage;
