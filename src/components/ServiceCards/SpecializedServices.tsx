import { useServiceCards } from "@/hooks/useServiceCards";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const SpecializedServices = () => {
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

  // Cores únicas para cada card
  const cardColors = [
    "from-red-500 to-pink-600",
    "from-blue-500 to-cyan-600", 
    "from-green-500 to-emerald-600",
    "from-purple-500 to-violet-600"
  ];

  const cardBgColors = [
    "bg-red-50 border-red-200",
    "bg-blue-50 border-blue-200",
    "bg-green-50 border-green-200", 
    "bg-purple-50 border-purple-200"
  ];

  return (
    <section className="relative py-20 md:py-24 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Elementos decorativos únicos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-100 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-green-100 rounded-full opacity-25"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-purple-100 rounded-full opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header revolucionário */}
        <div className="text-center mb-16 md:mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-white border-2 border-red-200 rounded-full px-8 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-red-600 animate-spin" />
                  <span className="text-lg font-black text-red-700 uppercase tracking-wider">Nossos Serviços</span>
                  <Star className="w-6 h-6 text-red-600 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-red-600 to-gray-900 bg-clip-text text-transparent">
              Serviços
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-pulse">
              Especializados
            </span>
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-4">
              Mais de <span className="font-black text-red-600 text-2xl md:text-3xl">10 anos</span> oferecendo
            </p>
            <p className="text-lg md:text-xl text-gray-600">
              os melhores serviços em games para <span className="font-bold text-red-600">Colatina e região</span>
            </p>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 md:h-80 w-full bg-gray-200 rounded-3xl" />
            ))}
          </div>
        )}

        {!loading && serviceCards.length > 0 && (
          <div className="relative">
            {/* Grid revolucionário - layout diagonal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
              {serviceCards.map((card, index) => (
                <div 
                  key={card.id} 
                  className={cn(
                    "group relative transform transition-all duration-700 hover:scale-105",
                    index % 2 === 0 ? "md:translate-y-0" : "md:translate-y-8"
                  )}
                >
                  {/* Card revolucionário */}
                  <Card
                    onClick={() => handleCardClick(card.link_url)}
                    className={cn(
                      "relative rounded-3xl h-full cursor-pointer overflow-hidden border-2 transition-all duration-500",
                      cardBgColors[index % 4],
                      "hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2"
                    )}
                  >
                    <CardContent className="p-8 md:p-10 h-full">
                      
                      {/* Header do card com gradiente */}
                      <div className="relative mb-8">
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r rounded-2xl blur-sm opacity-20",
                          cardColors[index % 4]
                        )}></div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className={cn(
                            "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                            cardColors[index % 4]
                          )}>
                            {!imageErrors[card.id] && card.image_url ? (
                              <img
                                src={card.image_url}
                                alt={card.title}
                                className="w-8 h-8 md:w-10 md:h-10 object-contain filter brightness-0 invert"
                                loading="lazy"
                                onError={() => handleImageError(card.id)}
                              />
                            ) : (
                              <Zap className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            )}
                          </div>
                          
                          {/* Número do serviço */}
                          <div className="text-right">
                            <span className={cn(
                              "text-6xl md:text-7xl font-black opacity-20 bg-gradient-to-br bg-clip-text text-transparent",
                              cardColors[index % 4]
                            )}>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Conteúdo do card */}
                      <div className="relative">
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight group-hover:text-red-700 transition-colors duration-300">
                          {card.title}
                        </h3>
                        
                        <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-8 group-hover:text-gray-800 transition-colors duration-300">
                          {card.description}
                        </p>
                        
                        {/* Call to action revolucionário */}
                        <div className={cn(
                          "inline-flex items-center gap-3 bg-gradient-to-r text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg",
                          cardColors[index % 4]
                        )}>
                          <span className="text-sm md:text-base">Saiba mais</span>
                          <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                      
                      {/* Elemento decorativo único */}
                      <div className={cn(
                        "absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 transition-all duration-500 group-hover:scale-150 group-hover:opacity-20",
                        cardColors[index % 4].replace('to-', 'to-transparent from-')
                      )}></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Call to action final revolucionário */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white font-black py-6 px-12 rounded-3xl text-xl md:text-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/30 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <Sparkles className="w-7 h-7 animate-spin" />
                    <span>Descubra Todos os Nossos Serviços</span>
                    <ArrowRight className="w-7 h-7 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && serviceCards.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-xl">Nenhum serviço cadastrado.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SpecializedServices;

