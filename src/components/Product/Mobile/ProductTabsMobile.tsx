import React, { useState, useEffect, useRef } from 'react';
import { Product } from '@/hooks/useProducts';
import { ChevronDown, ChevronUp, Info, Package, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductSpecifications } from '@/hooks/useProductSpecifications';

interface ProductTabsMobileProps {
  product: Product;
}

const ProductTabsMobile: React.FC<ProductTabsMobileProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<string | null>('description');
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Buscar especificações reais do produto (apenas mobile)
  const { categorizedSpecs, loading: specsLoading } = useProductSpecifications(product.id, 'mobile', product);

  // Função para fazer scroll preciso alinhando com o cabeçalho
  const scrollToContent = (tabId: string) => {
    setTimeout(() => {
      const contentElement = contentRefs.current[tabId];
      if (contentElement) {
        // Tenta diferentes seletores para encontrar o cabeçalho
        const possibleHeaders = [
          document.querySelector('header'),
          document.querySelector('.header'),
          document.querySelector('[data-header]'),
          document.querySelector('nav'),
          document.querySelector('.navbar'),
          document.querySelector('.nav')
        ].filter(Boolean);
        
        let headerHeight = 0;
        
        // Calcula a altura total de todos os elementos de cabeçalho encontrados
        possibleHeaders.forEach(element => {
          if (element) {
            const rect = element.getBoundingClientRect();
            // Só considera elementos que estão no topo da página (position fixed/sticky)
            if (rect.top <= 10) { // margem de 10px para elementos sticky
              headerHeight = Math.max(headerHeight, rect.bottom);
            }
          }
        });
        
        // Se não encontrar cabeçalho, usa altura padrão baseada no viewport
        if (headerHeight === 0) {
          headerHeight = window.innerHeight * 0.1; // 10% da altura da tela
        }
        
        // Adiciona uma margem extra para melhor visualização
        const extraMargin = 96; // Aumentei de 72px para 96px para bem mais respiro visual
        headerHeight += extraMargin;
        
        // Calcula a posição do elemento expandido
        const elementRect = contentElement.getBoundingClientRect();
        const elementTop = elementRect.top + window.pageYOffset;
        
        // Calcula a posição final: topo do elemento - altura do cabeçalho
        const finalScrollPosition = elementTop - headerHeight;
        
        // Faz scroll suave para a posição calculada
        window.scrollTo({
          top: Math.max(0, finalScrollPosition),
          behavior: 'smooth'
        });
      }
    }, 250); // Aumentei para 250ms para garantir estabilidade
  };

  const tabs = [
    {
      id: 'description',
      title: 'Descrição do Produto',
      icon: Info,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            {product.description || `${product.name} oferece a melhor experiência de jogo com gráficos 4K, Ray Tracing, feedback háptico DualSense e carregamento ultra-rápido. Uma experiência next-gen completa.`}
          </p>
          
          {product.features && product.features.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Características principais:</h4>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'specifications',
      title: 'Especificações Técnicas',
      icon: Package,
      content: (
        <div className="space-y-4">
          {specsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full"></div>
            </div>
          ) : categorizedSpecs.length > 0 ? (
            <div className="space-y-6">
              {categorizedSpecs.map((category) => (
                <div key={category.category} className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    {category.items[0]?.icon && (
                      <span className="text-xl">{category.items[0].icon}</span>
                    )}
                    {category.category}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {category.items.map((spec) => (
                      <div key={spec.id} className={`rounded-xl p-4 ${spec.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900 text-sm flex items-center gap-2">
                            {spec.icon && spec.icon !== category.items[0]?.icon && (
                              <span className="text-lg">{spec.icon}</span>
                            )}
                            {spec.label}
                          </div>
                          <div className="text-gray-700 text-sm">{spec.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma especificação disponível</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'shipping',
      title: 'Entrega e Garantias',
      icon: Shield,
      content: (
        <div className="space-y-6">
          {/* Shipping Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg">📦 Informações de Entrega</h4>
            <div className="bg-blue-50 rounded-xl p-4 space-y-4">
              <div className="space-y-1">
                <div className="font-medium text-gray-900 text-sm">Frete Grátis</div>
                <div className="text-green-600 font-semibold text-sm">Compras acima de R$ 150</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-gray-900 text-sm">Prazo de Entrega</div>
                <div className="text-gray-700 text-sm">2 a 5 dias úteis</div>
              </div>
              <div className="space-y-1">
                <div className="font-medium text-gray-900 text-sm">Rastreamento</div>
                <div className="text-gray-700 text-sm">Código enviado por email</div>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg">🛡️ Suas Garantias</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: 'Produto Original', desc: '100% original e lacrado de fábrica' },
                { title: 'Troca Garantida', desc: '7 dias para trocar sem complicação' },
                { title: 'Garantia UTI', desc: '30 dias de garantia contra defeitos' },
                { title: 'Suporte Especializado', desc: 'Atendimento gamer por especialistas' }
              ].map((guarantee, index) => (
                <div key={index} className="bg-green-50 rounded-xl p-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 text-sm">{guarantee.title}</div>
                    <div className="text-gray-700 text-sm">{guarantee.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Policy */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg">🔄 Política de Troca</h4>
            <div className="bg-yellow-50 rounded-xl p-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg leading-none">•</span>
                  <span className="text-gray-700 text-sm">7 dias corridos a partir do recebimento</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg leading-none">•</span>
                  <span className="text-gray-700 text-sm">Produto deve estar lacrado e sem sinais de uso</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg leading-none">•</span>
                  <span className="text-gray-700 text-sm">Embalagem original preservada</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg leading-none">•</span>
                  <span className="text-gray-700 text-sm">Frete de retorno por conta da UTI dos Games</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Perguntas Frequentes',
      icon: HelpCircle,
      content: (
        <div className="space-y-4">
          {[
            {
              question: 'O jogo é compatível com PlayStation 4?',
              answer: 'Este produto é específico para PlayStation 5. Para PS4, temos uma versão separada disponível em nossa loja.'
            },
            {
              question: 'Posso trocar por outro jogo?',
              answer: 'Sim! Você tem 7 dias para trocar por qualquer outro produto de valor igual ou superior, pagando apenas a diferença.'
            },
            {
              question: 'O jogo vem dublado em português?',
              answer: 'Sim, o jogo inclui dublagem e legendas em português brasileiro, além de outros idiomas.'
            },
            {
              question: 'Qual o prazo de entrega para minha região?',
              answer: 'O prazo padrão é de 2 a 5 dias úteis. Você pode consultar o prazo específico inserindo seu CEP no checkout.'
            },
            {
              question: 'Posso retirar na loja física?',
              answer: 'Sim! Nossa loja fica em Colatina-ES. Você pode escolher a opção "Retirar na loja" no checkout.'
            }
          ].map((faq, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h5 className="font-semibold text-gray-900">{faq.question}</h5>
              <p className="text-gray-700 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
          
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-gray-700 mb-3">Não encontrou sua resposta?</p>
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-600 hover:bg-blue-100"
            >
              💬 Falar com Especialista
            </Button>
          </div>
        </div>
      )
    }
  ];

  const toggleTab = (tabId: string) => {
    const isOpening = activeTab !== tabId;
    
    setActiveTab(activeTab === tabId ? null : tabId);
    
    // Se está abrindo um accordion, faz scroll para mostrar o conteúdo
    if (isOpening) {
      scrollToContent(tabId);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="bg-white"
    >
      <div className="px-6 py-8 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Informações do Produto
        </h2>
        
        {tabs.map((tab) => (
          <div key={tab.id} className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleTab(tab.id)}
              className="w-full p-6 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <tab.icon className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-semibold text-gray-900 text-lg">
                  {tab.title}
                </span>
              </div>
              <div className="transition-transform duration-200">
                {activeTab === tab.id ? (
                  <ChevronUp className="w-6 h-6 text-gray-500" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-500" />
                )}
              </div>
            </button>
            
            {activeTab === tab.id && (
              <div 
                ref={(el) => contentRefs.current[tab.id] = el}
                className="px-6 pb-6 bg-gray-50 transition-all duration-200 ease-out"
              >
                <div className="pt-4">
                  {tab.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductTabsMobile;

