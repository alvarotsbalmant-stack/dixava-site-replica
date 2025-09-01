import { useServiceCards } from "@/hooks/useServiceCards";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Gamepad2, Wrench, Search, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const SpecializedServicesUltraCompact = () => {
  const { serviceCards, loading } = useServiceCards();
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleCardClick = (linkUrl: string, cardTitle: string) => {
    if (linkUrl.startsWith("http")) {
      window.open(linkUrl, "_blank");
    } else {
      // Mapear títulos dos cards para parâmetros de serviço
      const serviceMapping: Record<string, string> = {
        "Manutenção Preventiva": "manutencao-preventiva",
        "Diagnóstico + Reparo": "diagnostico-reparo", 
        "Avaliação para Venda": "avaliacao-venda"
        // "Serviços em Geral" não tem mapeamento - vai direto sem parâmetro
      };
      
      const serviceParam = serviceMapping[cardTitle];
      
      if (serviceParam && linkUrl.includes("/servicos/assistencia")) {
        // Adicionar parâmetro de serviço para seleção automática
        navigate(`${linkUrl}?service=${serviceParam}`);
      } else {
        navigate(linkUrl);
      }
    }
  };

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  // Ícones únicos para cada serviço
  const serviceIcons = [Gamepad2, Wrench, Search, Settings];

  return (
    <section className="relative py-6 md:py-8 overflow-hidden bg-white">
      {/* Elementos decorativos sutis - tons de cinza */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-4 left-4 w-12 h-12 bg-gray-200 rounded-full opacity-30"></div>
        <div className="absolute top-6 right-6 w-10 h-10 bg-gray-300 rounded-full opacity-40"></div>
        <div className="absolute bottom-6 left-1/4 w-8 h-8 bg-gray-200 rounded-full opacity-30"></div>
        <div className="absolute bottom-4 right-1/3 w-10 h-10 bg-gray-300 rounded-full opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header estilo GameStop */}
        <div className="flex items-center justify-between mb-2 px-4 md:px-0">
          <div className="flex-1 text-center">
            <h2 className="text-xl md:text-4xl font-semibold leading-tight tracking-tight text-gray-900 mb-2" style={{ fontFamily: 'Poppins, "Open Sans", sans-serif', letterSpacing: '-0.24px' }}>
              Serviços Especializados
            </h2>
            
            {/* Subtítulo clean */}
            <div className="max-w-xl mx-auto">
              <p className="text-base md:text-lg text-gray-600 leading-snug">
                Mais de <span className="font-semibold text-gray-900">10 anos</span> oferecendo
                os melhores serviços em games para <span className="font-semibold text-gray-900">Colatina e região</span>
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 md:h-36 w-full bg-gray-200 rounded-xl" />
            ))}
          </div>
        )}

        {!loading && serviceCards.length > 0 && (
          <div className="relative">
            {/* Grid clean */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
              {serviceCards.map((card, index) => {
                const IconComponent = serviceIcons[index % 4];
                
                return (
                  <div 
                    key={card.id} 
                    className="group relative transform transition-all duration-300 hover:scale-[1.01]"
                  >
                    {/* Card clean estilo GameStop com fundo configurável */}
                    <Card
                      onClick={() => handleCardClick(card.link_url, card.title)}
                      className="relative rounded-xl h-full cursor-pointer overflow-hidden border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group"
                      style={{
                        backgroundImage: card.background_image_url 
                          ? `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9)), url(${card.background_image_url})`
                          : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: card.background_image_url ? 'transparent' : 'white'
                      }}
                    >
                      <CardContent className="p-4 md:p-6 h-full flex flex-col justify-between relative">
                        {/* Número clean */}
                        <div className="absolute top-3 right-3 text-6xl md:text-7xl font-black text-gray-100 leading-none select-none">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        
                        <div className="relative z-10">
                          {/* Ícone clean */}
                          <div className="flex items-center gap-3 mb-3">
                            {card.image_url && !imageErrors[card.id] ? (
                              <img 
                                src={card.image_url} 
                                alt={card.title}
                                className="w-8 h-8 md:w-10 md:h-10 object-contain"
                                onError={() => handleImageError(card.id)}
                              />
                            ) : (
                              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                                <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* Conteúdo clean */}
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 leading-tight">
                            {card.title}
                          </h3>
                          <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed">
                            {card.description}
                          </p>
                          
                          {/* Botão clean estilo GameStop */}
                          <div className="bg-black text-white rounded font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center w-fit px-4 py-2" style={{ 
                            border: '2px solid #000000',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            lineHeight: '1',
                            height: '36px',
                            minWidth: '100px',
                            padding: '6px 12px'
                          }}>
                            <span>Saiba mais</span>
                            <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 transition-transform duration-300 group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && serviceCards.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-base">Nenhum serviço cadastrado.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecializedServicesUltraCompact;

