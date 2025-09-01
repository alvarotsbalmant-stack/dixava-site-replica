import { useServiceCards } from "@/hooks/useServiceCards";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Sparkles, Zap, Gamepad2, Wrench, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const SpecializedServicesOptimized = () => {
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

  // Cores alinhadas com o design da UTI dos Games
  const cardGradients = [
    "from-red-500 via-red-600 to-red-700",
    "from-blue-500 via-blue-600 to-blue-700", 
    "from-green-500 via-green-600 to-green-700",
    "from-purple-500 via-purple-600 to-purple-700"
  ];

  const cardBorders = [
    "border-red-200 hover:border-red-300 shadow-red-500/10",
    "border-blue-200 hover:border-blue-300 shadow-blue-500/10",
    "border-green-200 hover:border-green-300 shadow-green-500/10", 
    "border-purple-200 hover:border-purple-300 shadow-purple-500/10"
  ];

  const cardBackgrounds = [
    "bg-red-50/50 hover:bg-red-50",
    "bg-blue-50/50 hover:bg-blue-50",
    "bg-green-50/50 hover:bg-green-50", 
    "bg-purple-50/50 hover:bg-purple-50"
  ];

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Elementos decorativos sutis */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-red-100 rounded-full opacity-40"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-blue-100 rounded-full opacity-50"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-100 rounded-full opacity-40"></div>
        <div className="absolute bottom-10 right-1/3 w-18 h-18 bg-purple-100 rounded-full opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header compacto mas impactante */}
        <div className="text-center mb-12 md:mb-16">
          {/* Badge otimizado */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-md opacity-25"></div>
              <div className="relative bg-white border-2 border-red-200 rounded-full px-6 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-600" />
                  <span className="text-base font-bold text-red-700 uppercase tracking-wide">Nossos Serviços</span>
                  <Star className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Título otimizado */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 bg-clip-text text-transparent">
              Serviços
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Especializados
            </span>
          </h2>
          
          {/* Subtítulo compacto */}
          <div className="max-w-2xl mx-auto">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Mais de <span className="font-black text-red-600 text-xl md:text-2xl">10 anos</span> oferecendo
              os melhores serviços em games para <span className="font-bold text-red-600">Colatina e região</span>
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 md:h-56 w-full bg-gray-200 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && serviceCards.length > 0 && (
          <div className="relative">
            {/* Grid otimizado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
              {serviceCards.map((card, index) => {
                const IconComponent = serviceIcons[index % 4];
                
                return (
                  <div 
                    key={card.id} 
                    className="group relative transform transition-all duration-500 hover:scale-[1.02]"
                  >
                    {/* Card otimizado */}
                    <Card
                      onClick={() => handleCardClick(card.link_url)}
                      className={cn(
                        "relative rounded-2xl h-full cursor-pointer overflow-hidden border-2 transition-all duration-300 shadow-lg",
                        cardBorders[index % 4],
                        cardBackgrounds[index % 4],
                        "hover:shadow-xl hover:-translate-y-1"
                      )}
                    >
                      <CardContent className="p-6 md:p-8 h-full relative">
                        
                        {/* Número sutil no fundo */}
                        <div className="absolute top-2 right-2 opacity-8">
                          <span className="text-6xl md:text-7xl font-black text-gray-200">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        
                        {/* Header do card compacto */}
                        <div className="relative mb-6">
                          <div className={cn(
                            "w-16 h-16 md:w-18 md:h-18 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 mb-4",
                            cardGradients[index % 4]
                          )}>
                            {!imageErrors[card.id] && card.image_url ? (
                              <img
                                src={card.image_url}
                                alt={card.title}
                                className="w-8 h-8 md:w-9 md:h-9 object-contain filter brightness-0 invert"
                                loading="lazy"
                                onError={() => handleImageError(card.id)}
                              />
                            ) : (
                              <IconComponent className="w-8 h-8 md:w-9 md:h-9 text-white" />
                            )}
                          </div>
                        </div>
                        
                        {/* Conteúdo do card compacto */}
                        <div className="relative z-10">
                          <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 leading-tight group-hover:text-red-700 transition-colors duration-300">
                            {card.title}
                          </h3>
                          
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-6 group-hover:text-gray-800 transition-colors duration-300">
                            {card.description}
                          </p>
                          
                          {/* Call to action compacto */}
                          <div className={cn(
                            "inline-flex items-center gap-2 bg-gradient-to-r text-white font-bold py-3 px-5 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg text-sm",
                            cardGradients[index % 4]
                          )}>
                            <span>Saiba mais</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </div>
                        </div>
                        
                        {/* Elemento decorativo sutil */}
                        <div className={cn(
                          "absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-5 transition-all duration-300 group-hover:scale-125 group-hover:opacity-10",
                          cardGradients[index % 4].replace('to-', 'to-transparent from-')
                        )}></div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Call to action final compacto */}
            <div className="text-center">
              <div className="relative inline-block group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white font-black py-4 px-8 rounded-2xl text-lg md:text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    <span>Descubra Todos os Nossos Serviços</span>
                    <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && serviceCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum serviço cadastrado.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecializedServicesOptimized;

