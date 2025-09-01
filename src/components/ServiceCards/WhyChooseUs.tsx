import {
  Shield,
  Users,
  Award,
  Star,
  Gamepad2,
  Trophy,
  Zap,
  Heart,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const WhyChooseUs = () => {
  const differentiators = [
    {
      icon: Trophy,
      title: "10+ Anos de Tradição",
      description: "Referência consolidada em games na região de Colatina",
      stats: "2015"
    },
    {
      icon: Gamepad2,
      title: "Especialistas Gamers",
      description: "Equipe apaixonada que vive e respira games",
      stats: "100%"
    },
    {
      icon: Shield,
      title: "Garantia Total",
      description: "Produtos originais com garantia completa",
      stats: "365d"
    },
    {
      icon: Heart,
      title: "Atendimento VIP",
      description: "Suporte personalizado para cada gamer",
      stats: "24/7"
    },
  ];

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-slate-900">
      {/* Fundo limpo e elegante */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black"></div>
      
      {/* Elemento decorativo sutil no topo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header compacto */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 rounded-full px-4 py-1.5 mb-3">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-300">Por que somos diferentes</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
            Por que escolher a{" "}
            <span className="text-red-400">UTI DOS GAMES</span>?
          </h2>
          
          <p className="text-base text-gray-300 max-w-xl mx-auto">
            Mais de uma década oferecendo a melhor experiência em games para Colatina e região.
          </p>
        </div>

        {/* Grid de diferenciais - 2 colunas no mobile, 4 no desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
          {differentiators.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={index} 
                className="group relative"
              >
                {/* Card principal */}
                <div className={cn(
                  "relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 md:p-5 h-full",
                  "transition-all duration-300 ease-out",
                  "hover:bg-gray-800/70 hover:border-red-500/30 hover:scale-[1.02]",
                  "hover:shadow-lg hover:shadow-red-500/10"
                )}>
                  
                  {/* Ícone */}
                  <div className="relative mb-3 md:mb-4">
                    <div className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center transition-all duration-300",
                      "bg-red-600 shadow-md",
                      "group-hover:bg-red-500"
                    )}>
                      <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    
                    {/* Badge com estatística */}
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-md shadow-md">
                      {item.stats}
                    </div>
                  </div>
                  
                  {/* Conteúdo */}
                  <div className="relative">
                    <h3 className="text-sm md:text-base font-bold text-white mb-1 md:mb-2 group-hover:text-red-200 transition-colors duration-300 leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Linha vermelha sutil no hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-lg"></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Call to action */}
        <div className="text-center">
          <button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25">
            <Gamepad2 className="w-4 h-4" />
            <span>Conheça Nossa Loja</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

