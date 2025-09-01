import React from 'react';
import { MessageCircle, Star, ExternalLink, MapPin, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleReviewsProps {
  className?: string;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ className }) => {
  // Dados hardcoded da UTI DOS GAMES - sempre consistentes
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
    <div className={cn("space-y-4 w-full max-w-sm", className)}>
      {/* Card Principal */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm w-full">
        {/* Header com foto e info da empresa */}
        <div className="flex gap-3 mb-4">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-base mb-1">
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
            <span className="text-xl font-bold text-gray-900">
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
            <div key={index} className={cn("pb-3", index < 1 && "border-b border-gray-100")}>
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
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver todas no Google
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleReviews;

