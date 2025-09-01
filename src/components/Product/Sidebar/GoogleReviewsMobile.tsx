import React from 'react';
import { Star, ExternalLink, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleReviewsMobileProps {
  className?: string;
}

const GoogleReviewsMobile: React.FC<GoogleReviewsMobileProps> = ({ className }) => {
  // Dados hardcoded da UTI DOS GAMES - sempre consistentes com desktop
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
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-3 h-3 fill-yellow-400 text-yellow-400 opacity-50" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className={cn("border-t border-gray-100 p-4", className)}>
      {/* Header da seção */}
      <h3 className="font-medium text-gray-900 mb-4">Avaliações Google</h3>

      {/* Container principal - layout mobile compacto */}
      <div className="space-y-3">
        {/* Header com ícone e nome da loja */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm">
              {reviewsData.name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span className="truncate">Centro, Colatina - ES</span>
            </div>
          </div>
        </div>

        {/* Rating compacto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {reviewsData.rating}
            </span>
            <div className="flex items-center gap-1">
              {renderStars(reviewsData.rating)}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {reviewsData.totalReviews} avaliações
          </div>
        </div>

        {/* Reviews resumidas - apenas 1 para mobile */}
        <div className="space-y-3">
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                {renderStars(reviewsData.reviews[0].rating)}
              </div>
              <span className="text-xs text-gray-500">{reviewsData.reviews[0].date}</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed mb-1">
              "{reviewsData.reviews[0].text}"
            </p>
            <p className="text-xs font-medium text-gray-600">
              {reviewsData.reviews[0].author}
            </p>
          </div>
        </div>

        {/* Botão Ver no Google - mobile friendly */}
        <div className="pt-2">
          <a
            href={reviewsData.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            <ExternalLink className="w-4 h-4" />
            Ver no Google
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviewsMobile;