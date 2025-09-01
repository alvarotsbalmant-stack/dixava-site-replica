import {
  Shield,
  Users,
  Award,
  Star,
  Gamepad2,
  Trophy,
  Zap,
  Heart,
  Clock,
  MessageCircle,
  ExternalLink,
  MapPin,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const WhyChooseUsWithReviews = () => {
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

  // Dados das avaliações Google
  const reviewsData = {
    name: 'UTI DOS GAMES',
    rating: 4.9,
    totalReviews: 718,
    address: 'R. Alexandre Calmon, 314 - Centro, Colatina - ES',
    reviews: [
      {
        author: 'João Silva',
        rating: 5,
        date: 'há 2 dias',
        text: 'Ótimo lugar para assistência, venda de usados e compra de novos produtos.'
      },
      {
        author: 'Maria Santos',
        rating: 5,
        date: 'há 1 semana',
        text: 'Loja responsável muito bem localizada, uma boa variedade de produtos.'
      },
      {
        author: 'Carlos Oliveira',
        rating: 4,
        date: 'há 2 semanas',
        text: 'Excelente atendimento e produtos de qualidade. Recomendo!'
      }
    ],
    googleMapsUrl: 'https://www.google.com/maps/place/UTI+DOS+GAMES/@-19.5356468,-40.6348066,17z/data=!3m1!4b1!4m6!3m5!1s0xb7a828c3402987:0x2a48c6b1a44baede!8m2!3d-19.5356468!4d-40.6322317!16s%2Fg%2F1hc388n7x?entry=ttu&g_ep=EgoyMDI1MDgxMC4wIKXMDSoASAFQAw%3D%3D'
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-gray-300">
      {/* Fundo cinza bem mais claro e suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400"></div>
      
      {/* Elemento decorativo sutil no topo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header alinhado à esquerda */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-end">
            
            {/* 70% - Header + Conteúdo Principal */}
            <div className="w-full lg:w-[70%]">
              {/* Header alinhado à esquerda */}
              <div className="text-left mb-6">
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-400/20 rounded-full px-4 py-1.5 mb-3">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-600">Por que somos diferentes</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">
                  Por que escolher a{" "}
                  <span className="text-red-500">UTI DOS GAMES</span>?
                </h2>
                
                <p className="text-base text-gray-700 max-w-xl">
                  Mais de uma década oferecendo a melhor experiência em games para Colatina e região.
                </p>
              </div>

              {/* Grid de diferenciais - 2 colunas no mobile, 2 no desktop (compactado) */}
              <div className="grid grid-cols-2 gap-4 md:gap-5 mb-6">
                {differentiators.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div 
                      key={index} 
                      className="group relative"
                    >
                      {/* Card principal */}
                      <div className={cn(
                        "relative bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg p-3 md:p-4 h-full shadow-sm",
                        "transition-all duration-300 ease-out",
                        "hover:bg-white hover:border-red-300/50 hover:scale-[1.02]",
                        "hover:shadow-md hover:shadow-red-400/10"
                      )}>
                        
                        {/* Ícone */}
                        <div className="relative mb-2 md:mb-3">
                          <div className={cn(
                            "w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                            "bg-red-500 shadow-sm",
                            "group-hover:bg-red-400"
                          )}>
                            <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          
                          {/* Badge com estatística */}
                          <div className="absolute -top-1 -right-1 bg-red-400 text-white text-xs font-bold px-1 py-0.5 rounded-md shadow-sm">
                            {item.stats}
                          </div>
                        </div>
                        
                        {/* Conteúdo */}
                        <div className="relative">
                          <h3 className="text-xs md:text-sm font-bold text-gray-800 mb-1 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                            {item.description}
                          </p>
                        </div>
                        
                        {/* Linha vermelha sutil no hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-lg"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Call to action */}
              <div className="text-left">
                <button className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-red-400/20">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Conheça Nossa Loja</span>
                </button>
              </div>
            </div>

            {/* 30% - Avaliações Google (alinhada com a base do botão) */}
            <div className="w-full lg:w-[30%] flex flex-col justify-end">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-800 text-sm">Avaliações Google</span>
                </div>

                {/* Card Principal */}
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/80 rounded-lg p-4 shadow-md">
                  {/* Header com foto e info da empresa */}
                  <div className="flex gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-base mb-1">
                        {reviewsData.name}
                      </h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{reviewsData.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating e total de avaliações */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-bold text-gray-800">
                        {reviewsData.rating}/5
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(reviewsData.rating)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span>{reviewsData.totalReviews} avaliações</span>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div className="space-y-3 mb-4">
                    {reviewsData.reviews.slice(0, 2).map((review, index) => (
                      <div key={index} className={cn("pb-3", index < 1 && "border-b border-gray-200")}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-1">
                          "{review.text}"
                        </p>
                        <p className="text-xs font-medium text-gray-600">
                          {review.author}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Link para ver todas as avaliações */}
                  <div className="text-center">
                    <a
                      href={reviewsData.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver todas no Google
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsWithReviews;

