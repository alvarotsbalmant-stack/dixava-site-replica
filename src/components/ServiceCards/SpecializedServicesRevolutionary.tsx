import { useServiceCards } from "@/hooks/useServiceCards";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Sparkles, Zap, Gamepad2, Wrench, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const SpecializedServicesRevolutionary = () => {
  const { serviceCards, loading } = useServiceCards();
  const navigate = useNavigate();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleCardClick = (linkUrl: string) => {
    if (linkUrl.startsWith("http")) {
      window.open(linkUrl, "_blank");
    } else {
      navigate(linkUrl);
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

  // Cores vibrantes para cada card
  const cardGradients = [
    "from-red-500 via-red-600 to-red-700",
    "from-blue-500 via-blue-600 to-blue-700", 
    "from-green-500 via-green-600 to-green-700",
    "from-purple-500 via-purple-600 to-purple-700"
  ];

  const cardBorders = [
    "border-red-300 shadow-red-500/20",
    "border-blue-300 shadow-blue-500/20",
    "border-green-300 shadow-green-500/20", 
    "border-purple-300 shadow-purple-500/20"
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-white">
      {/* Padrão de fundo único */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" 
             style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, #ef4444 2px, transparent 2px),
                                radial-gradient(circle at 75% 75%, #3b82f6 2px, transparent 2px)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header REVOLUCIONÁRIO */}
        <div className="text-center mb-20 md:mb-24">
          {/* Badge animado */}
          <div className="flex items-center justify-center mb-10">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500 to-blue-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative bg-white border-4 border-red-500 rounded-full px-10 py-4 shadow-2xl">
                <div className="flex items-center gap-4">
                  <Star className="w-8 h-8 text-red-600 animate-pulse" />
                  <span className="text-2xl font-black text-red-700 uppercase tracking-widest">Nossos Serviços</span>
                  <Sparkles className="w-8 h-8 text-red-600 animate-spin" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Título GIGANTE */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-none">
            <span className="block bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 bg-clip-text text-transparent">
              Serviços
            </span>
            <span className="block bg-gradient-to-r from-red-600 via-pink-500 to-red-600 bg-clip-text text-transparent mt-2">
              Especializados
            </span>
          </h2>
          
          {/* Subtítulo impactante */}
          <div className="max-w-4xl mx-auto">
            <p className="text-2xl md:text-3xl text-gray-700 leading-relaxed mb-6">
              Mais de <span className="font-black text-red-600 text-3xl md:text-4xl animate-pulse">10 anos</span> oferecendo
            </p>
            <p className="text-xl md:text-2xl text-gray-600 font-medium">
              os melhores serviços em games para <span className="font-black text-red-600">Colatina e região</span>
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 md:h-96 w-full bg-gray-200 rounded-3xl" />
            ))}
          </div>
        )}

        {!loading && serviceCards.length > 0 && (
          <div className="relative">
            {/* Grid REVOLUCIONÁRIO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-20">
              {serviceCards.map((card, index) => {
                const IconComponent = serviceIcons[index % 4];
                
                return (
                  <div 
                    key={card.id} 
                    className="group relative transform transition-all duration-700 hover:scale-105"
                  >
                    {/* Card REVOLUCIONÁRIO */}
                    <Card
                      onClick={() => handleCardClick(card.link_url)}
                      className={cn(
                        "relative rounded-3xl h-full cursor-pointer overflow-hidden border-4 bg-white transition-all duration-500 shadow-2xl",
                        cardBorders[index % 4],
                        "hover:shadow-3xl hover:-translate-y-4"
                      )}
                    >
                      <CardContent className="p-10 md:p-12 h-full relative">
                        
                        {/* Número GIGANTE no fundo */}
                        <div className="absolute top-4 right-4 opacity-10">
                          <span className="text-9xl md:text-[12rem] font-black text-gray-900">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        
                        {/* Header do card */}
                        <div className="relative mb-10">
                          <div className={cn(
                            "w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center bg-gradient-to-br shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 mb-6",
                            cardGradients[index % 4]
                          )}>
                            {!imageErrors[card.id] && card.image_url ? (
                              <img
                                src={card.image_url}
                                alt={card.title}
                                className="w-12 h-12 md:w-14 md:h-14 object-contain filter brightness-0 invert"
                                loading="lazy"
                                onError={() => handleImageError(card.id)}
                              />
                            ) : (
                              <IconComponent className="w-12 h-12 md:w-14 md:h-14 text-white" />
                            )}
                          </div>
                        </div>
                        
                        {/* Conteúdo do card */}
                        <div className="relative z-10">
                          <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight group-hover:text-red-700 transition-colors duration-300">
                            {card.title}
                          </h3>
                          
                          <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-10 group-hover:text-gray-800 transition-colors duration-300">
                            {card.description}
                          </p>
                          
                          {/* Call to action REVOLUCIONÁRIO */}
                          <div className={cn(
                            "inline-flex items-center gap-4 bg-gradient-to-r text-white font-black py-5 px-8 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl text-lg",
                            cardGradients[index % 4]
                          )}>
                            <span>Saiba mais</span>
                            <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
                          </div>
                        </div>
                        
                        {/* Elemento decorativo ÚNICO */}
                        <div className={cn(
                          "absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10 transition-all duration-500 group-hover:scale-150 group-hover:opacity-20",
                          cardGradients[index % 4].replace('to-', 'to-transparent from-')
                        )}></div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Call to action final REVOLUCIONÁRIO */}
            <div className="text-center">
              <div className="relative inline-block group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-pink-500 to-red-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white font-black py-8 px-16 rounded-3xl text-2xl md:text-3xl transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
                  <div className="flex items-center gap-6">
                    <Star className="w-10 h-10 animate-pulse" />
                    <span>Descubra Todos os Nossos Serviços</span>
                    <ArrowRight className="w-10 h-10 transition-transform duration-300 group-hover:translate-x-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && serviceCards.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-2xl">Nenhum serviço cadastrado.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecializedServicesRevolutionary;

