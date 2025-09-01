import React, { useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProductSpecifications } from '@/hooks/useProductSpecifications';

interface ProductTabsEnhancedProps {
  product: any;
}

const ProductTabsEnhanced: React.FC<ProductTabsEnhancedProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [jsonbData, setJsonbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { categorizedSpecs, loading: specsLoading } = useProductSpecifications(product?.id, 'desktop', product);

  // Buscar campos JSONB diretamente da tabela products
  useEffect(() => {
    const fetchJsonbData = async () => {
      if (!product?.id) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('product_faqs, product_descriptions, specifications')
          .eq('id', product.id)
          .single();

        if (error) {
          console.error('Erro ao buscar campos JSONB:', error);
        } else {
          setJsonbData(data);
        }
      } catch (err) {
        console.error('Exceção ao buscar campos JSONB:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJsonbData();
  }, [product?.id]);

  // Processar especificações estruturadas - usando o hook que já aplica o sistema de códigos
  const getSpecifications = () => {
    console.log('[ProductTabsEnhanced] Processando especificações com hook:', categorizedSpecs);
    
    // Se temos especificações categorizadas do hook, use-as (já com emojis e nomes corretos)
    if (categorizedSpecs && categorizedSpecs.length > 0) {
      return categorizedSpecs.map(categoryGroup => ({
        name: categoryGroup.category, // Já vem formatado com emoji e nome correto
        specs: categoryGroup.items.map(item => ({
          label: item.label,
          value: item.value,
          highlight: item.highlight || false
        }))
      }));
    }
    
    // Fallback para especificações do produto (legacy)
    console.log('[ProductTabsEnhanced] Usando fallback para especificações:', product.specifications);
    
    if (product.specifications) {
      // Se é um array de objetos simples [{name: "x", value: "y"}]
      if (Array.isArray(product.specifications)) {
        return [{
          name: 'Especificações Técnicas',
          specs: product.specifications.map(spec => ({
            label: spec.name,
            value: spec.value,
            highlight: false
          }))
        }];
      }
      
      // Se é um objeto estruturado com categorias
      if (product.specifications.categories && Array.isArray(product.specifications.categories)) {
        return product.specifications.categories;
      }

      // Se é um objeto plano (chave-valor direto)
      if (typeof product.specifications === 'object' && !Array.isArray(product.specifications)) {
        return [{
          name: 'Especificações Técnicas',
          specs: Object.entries(product.specifications).map(([key, value]) => ({
            label: key,
            value: String(value),
            highlight: false
          }))
        }];
      }
    }
    
    console.log('[ProductTabsEnhanced] Nenhuma especificação encontrada');
    return [];
  };

  // Processar descrições múltiplas
  const getDescriptions = () => {
    const descriptions = product.product_descriptions || {};
    return {
      short: descriptions.short || product.description || '',
      detailed: descriptions.detailed || '',
      technical: descriptions.technical || '',
      marketing: descriptions.marketing || ''
    };
  };

  // Processar FAQ do produto
  const getFAQs = () => {
    console.log('[ProductTabsEnhanced] Processando FAQs:', product.product_faqs);
    
    // Priorizar dados JSONB carregados diretamente
    const faqs = jsonbData?.product_faqs || product.product_faqs;
    
    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      console.log('[ProductTabsEnhanced] FAQs encontrados:', faqs.length);
      return faqs.map((faq, index) => ({
        id: faq.id || index + 1,
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'Geral',
        is_visible: faq.is_visible !== false
      }));
    }
    
    console.log('[ProductTabsEnhanced] Nenhum FAQ encontrado');
    return [];
  };

  const specifications = getSpecifications();
  const descriptions = getDescriptions();
  const faqs = getFAQs();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="description" className="text-base font-medium">
              Descrição
            </TabsTrigger>
            <TabsTrigger value="specifications" className="text-base font-medium">
              Especificações
            </TabsTrigger>
            <TabsTrigger value="faq" className="text-base font-medium">
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* Aba Descrição */}
          <TabsContent value="description" className="space-y-6">
            <div className="prose max-w-none">
              {descriptions.marketing && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Destaque</h3>
                  <p className="text-gray-700 leading-relaxed">{descriptions.marketing}</p>
                </div>
              )}
              
              <div className="text-lg text-gray-700 leading-relaxed">
                {descriptions.detailed || descriptions.short || product.description || 
                  `Descubra ${product.name}, uma experiência única de gaming que vai revolucionar sua forma de jogar.`}
              </div>
              
              {descriptions.technical && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Informações Técnicas</h3>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{descriptions.technical}</p>
                  </div>
                </div>
              )}

              {/* Características destacadas */}
              {product.product_highlights && product.product_highlights.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Características Principais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.product_highlights.map((highlight) => (
                      <div key={highlight.id} className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <span className="text-gray-800 font-medium">{highlight.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba Especificações */}
          <TabsContent value="specifications" className="space-y-6">
            {specifications.length > 0 ? (
              <div className="grid gap-6">
                {specifications.map((category, index) => (
                  <div key={index} className="card"
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '1.5rem',
                      backgroundColor: 'white'
                    }}>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{category.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.specs && category.specs.map((spec, specIndex) => (
                          <div 
                            key={specIndex} 
                            className={`flex justify-between items-center p-3 rounded-lg ${
                              spec.highlight ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                            }`}
                          >
                            <span className="font-medium text-gray-700">{spec.label}:</span>
                            <span className={`font-semibold ${
                              spec.highlight ? 'text-red-600' : 'text-gray-900'
                            }`}>
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma especificação disponível</h3>
                  <p className="text-gray-500">
                    Ainda não há especificações técnicas cadastradas para este produto.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Aba FAQ */}
          <TabsContent value="faq" className="space-y-4">
            {faqs.length > 0 ? (
              faqs.filter(faq => faq.is_visible !== false).map((faq) => (
                <div key={faq.id} className="card"
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1.5rem',
                    backgroundColor: 'white'
                  }}>
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">{faq.question}</h4>
                    <p className="text-gray-700">{faq.answer}</p>
                    <Badge variant="outline" className="mt-3 text-xs">
                      {faq.category}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pergunta frequente</h3>
                  <p className="text-gray-500">
                    Ainda não há perguntas frequentes cadastradas para este produto.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductTabsEnhanced;

