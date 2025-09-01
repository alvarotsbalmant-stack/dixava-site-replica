import React, { useState, useEffect } from 'react';
import { Product } from '@/hooks/useProducts';
import { ChevronDown, ChevronUp, Star, User, CheckCircle, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ProductTabsMobileProps {
  product: any;
}

const ProductTabsMobile: React.FC<ProductTabsMobileProps> = ({ product }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [jsonbData, setJsonbData] = useState<any>(null);

  // Buscar campos JSONB diretamente da tabela products
  useEffect(() => {
    const fetchJsonbData = async () => {
      if (!product?.id) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('product_faqs, product_videos, product_descriptions, specifications')
          .eq('id', product.id)
          .single();

        if (!error) {
          setJsonbData(data);
        }
      } catch (err) {
        console.error('Erro ao buscar campos JSONB:', err);
      }
    };

    fetchJsonbData();
  }, [product?.id]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Processar especificações
  const getSpecifications = () => {
    if (product.specifications) {
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
      
      if (product.specifications.categories && Array.isArray(product.specifications.categories)) {
        return product.specifications.categories;
      }

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
    
    return [];
  };

  // Processar FAQs
  const getFAQs = () => {
    const faqs = jsonbData?.product_faqs || product.product_faqs;
    
    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      return faqs.map((faq, index) => ({
        id: faq.id || index + 1,
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'Geral',
        is_visible: faq.is_visible !== false
      }));
    }
    
    // FAQs mock
    return [
      {
        id: 1,
        question: 'O jogo vem lacrado e original?',
        answer: 'Sim! Todos os nossos jogos são 100% originais e lacrados de fábrica.',
      },
      {
        id: 2,
        question: 'Qual o prazo de entrega?',
        answer: 'O prazo de entrega varia de 2 a 5 dias úteis, dependendo da sua localização.',
      },
      {
        id: 3,
        question: 'Posso trocar o produto se não gostar?',
        answer: 'Sim! Oferecemos 7 dias para troca do produto, desde que esteja lacrado.',
      },
    ];
  };

  // Processar avaliações
  const getReviews = () => {
    return {
      rating: 4.8,
      count: 127,
      reviews: [
        {
          id: 1,
          name: 'João Santos',
          rating: 5,
          date: '2024-01-15',
          comment: 'Jogo incrível! Gráficos espetaculares e gameplay viciante.',
          verified: true,
        },
        {
          id: 2,
          name: 'Maria Silva',
          rating: 4,
          date: '2024-01-10',
          comment: 'Muito bom, mas achei um pouco difícil no início.',
          verified: true,
        }
      ]
    };
  };

  const specifications = getSpecifications();
  const faqs = getFAQs();
  const reviewsData = getReviews();

  const sections = [
    {
      id: 'description',
      title: 'Descrição do produto',
      content: (
        <div className="prose-sm">
          <p className="text-gray-700 leading-relaxed mb-4">
            {product.description || `Descubra ${product.name}, uma experiência única de gaming que vai revolucionar sua forma de jogar.`}
          </p>
          
          {product.product_highlights && product.product_highlights.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 mb-3">Características principais:</h4>
              {product.product_highlights.map((highlight) => (
                <div key={highlight.id} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{highlight.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'specifications',
      title: 'Especificações técnicas',
      content: (
        <div className="space-y-4">
          {specifications.length > 0 ? (
            specifications.map((category, index) => (
              <div key={index}>
                <h4 className="font-semibold text-gray-900 mb-3">{category.name}</h4>
                <div className="space-y-2">
                  {category.specs && category.specs.map((spec, specIndex) => (
                    <div 
                      key={specIndex} 
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-sm text-gray-600">{spec.label}</span>
                      <span className="text-sm font-medium text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Especificações não disponíveis.</p>
          )}
        </div>
      )
    },
    {
      id: 'reviews',
      title: `Avaliações (${reviewsData.count})`,
      content: (
        <div className="space-y-4">
          {/* Rating Summary */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{reviewsData.rating}</div>
              <div className="flex justify-center mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= reviewsData.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {reviewsData.count} avaliações
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviewsData.reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{review.name}</span>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Perguntas frequentes',
      content: (
        <div className="space-y-3">
          {faqs.filter(faq => 'is_visible' in faq ? faq.is_visible !== false : true).slice(0, 5).map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(`faq-${faq.id}`)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <span className="text-sm font-medium text-gray-900 pr-2">
                  {faq.question}
                </span>
                {expandedSection === `faq-${faq.id}` ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {expandedSection === `faq-${faq.id}` && (
                <div className="px-3 pb-3">
                  <p className="text-sm text-gray-700">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="bg-white">
      <div className="divide-y divide-gray-200">
        {sections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {section.title}
              </h3>
              {expandedSection === section.id ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSection === section.id && (
              <div className="px-4 pb-4">
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact CTA */}
      <div className="p-4 bg-gray-50 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Ainda tem dúvidas? Fale com nossos especialistas!
        </p>
        <Button
          onClick={() => {
            const message = `Olá! Tenho uma dúvida sobre o produto: ${product.name}`;
            const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
          }}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Falar no WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default ProductTabsMobile;