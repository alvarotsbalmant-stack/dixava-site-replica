
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProducts, Product } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FixedContentFormData, CarouselConfig } from '@/types/specialSections'; // Assuming types are centralized

const SpecialSectionCarouselPage: React.FC = () => {
  const { sectionId, carouselIndex } = useParams<{ sectionId: string; carouselIndex: string }>();
  const [carouselConfig, setCarouselConfig] = useState<CarouselConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);
  const { products, loading: loadingProducts, fetchProductsByConfig } = useProducts(); // Need a new fetch function
  
  // State for managing the product modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!sectionId || !carouselIndex) {
        setErrorConfig('ID da seção ou índice do carrossel inválido.');
        setLoadingConfig(false);
        return;
      }

      setLoadingConfig(true);
      setErrorConfig(null);
      try {
        const { data, error } = await supabase
          .from('special_sections')
          .select('content_config')
          .eq('id', sectionId)
          .single();

        if (error) throw error;

        if (data?.content_config) {
          const config = data.content_config as FixedContentFormData;
          const key = `carrossel_${carouselIndex}` as keyof FixedContentFormData;
          const specificCarouselConfig = config[key];
          if (specificCarouselConfig && 'title' in specificCarouselConfig) {
            setCarouselConfig(specificCarouselConfig as CarouselConfig);
          } else {
            throw new Error(`Configuração para carrossel ${carouselIndex} não encontrada.`);
          }
        } else {
          throw new Error('Configuração da seção especial não encontrada.');
        }
      } catch (err: any) {
        console.error('Erro ao buscar configuração do carrossel:', err);
        setErrorConfig(err.message || 'Falha ao carregar configuração.');
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [sectionId, carouselIndex]);

  useEffect(() => {
    if (carouselConfig) {
      // Fetch products based on the loaded config
      fetchProductsByConfig(carouselConfig);
    }
  }, [carouselConfig, fetchProductsByConfig]);

  // Function to handle opening the modal
  const handleProductCardClick = (productId: string) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  if (loadingConfig) {
    return <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]"><Loader2 className="h-12 w-12 animate-spin text-gray-500" /></div>;
  }

  if (errorConfig) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-500">Erro: {errorConfig}</div>;
  }

  if (!carouselConfig) {
     return <div className="container mx-auto px-4 py-8 text-center text-gray-500">Configuração do carrossel não encontrada.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><Link to="/" className="hover:text-gray-700">Início</Link></li>
          <li><span className="mx-2">/</span></li>
          {/* Maybe add link back to section if needed */}
          <li className="font-medium text-gray-700" aria-current="page">{carouselConfig.title || `Carrossel ${carouselIndex}`}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-6 text-center">{carouselConfig.title || `Carrossel ${carouselIndex}`}</h1>

      {loadingProducts ? (
        <div className="flex justify-center items-center min-h-[30vh]"><Loader2 className="h-8 w-8 animate-spin text-gray-500" /></div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2 pb-4">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onCardClick={handleProductCardClick}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Nenhum produto encontrado para este carrossel.</p>
      )}
    </div>
  );
};

export default SpecialSectionCarouselPage;
