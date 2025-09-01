import React, { useState } from 'react';
import { Product } from '@/hooks/useProducts';
import { Star, ThumbsUp, ThumbsDown, Camera, Filter, ChevronDown, Verified, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ProductReviewsWithPhotosProps {
  product: Product;
  className?: string;
}

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
    level: string;
  };
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  notHelpful: number;
  photos?: string[];
  verified_purchase: boolean;
  platform?: string;
}

const ProductReviewsWithPhotos: React.FC<ProductReviewsWithPhotosProps> = ({
  product,
  className
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Mock de avaliações
  const mockReviews: Review[] = [
    {
      id: '1',
      user: {
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        verified: true,
        level: 'Gamer Veterano'
      },
      rating: 5,
      title: 'Simplesmente incrível! Superou todas as expectativas',
      content: 'Comprei este jogo no lançamento e posso dizer que vale cada centavo. Os gráficos são de tirar o fôlego, a jogabilidade é fluida e a história é envolvente. O feedback háptico do DualSense adiciona uma camada extra de imersão que nunca experimentei antes.',
      date: '2024-01-15',
      helpful: 24,
      notHelpful: 2,
      photos: [
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300',
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300'
      ],
      verified_purchase: true,
      platform: 'PlayStation 5'
    },
    {
      id: '2',
      user: {
        name: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
        verified: true,
        level: 'Casual Gamer'
      },
      rating: 4,
      title: 'Muito bom, mas poderia ser melhor',
      content: 'O jogo é realmente bonito e divertido, mas achei alguns momentos um pouco repetitivos. A trilha sonora é excepcional e os personagens são bem desenvolvidos. Recomendo para quem gosta do gênero.',
      date: '2024-01-10',
      helpful: 18,
      notHelpful: 5,
      photos: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300'
      ],
      verified_purchase: true,
      platform: 'PlayStation 5'
    },
    {
      id: '3',
      user: {
        name: 'Pedro Costa',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        verified: false,
        level: 'Pro Gamer'
      },
      rating: 5,
      title: 'Obra-prima dos games!',
      content: 'Depois de 40 horas de gameplay, posso afirmar que este é um dos melhores jogos que já joguei. A atenção aos detalhes é impressionante, desde as animações até os efeitos sonoros. O Ray Tracing faz toda a diferença!',
      date: '2024-01-08',
      helpful: 31,
      notHelpful: 1,
      photos: [
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300',
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300'
      ],
      verified_purchase: true,
      platform: 'PlayStation 5'
    }
  ];

  const filters = [
    { id: 'all', label: 'Todas', count: mockReviews.length },
    { id: '5', label: '5 estrelas', count: mockReviews.filter(r => r.rating === 5).length },
    { id: '4', label: '4 estrelas', count: mockReviews.filter(r => r.rating === 4).length },
    { id: '3', label: '3 estrelas', count: 0 },
    { id: 'photos', label: 'Com fotos', count: mockReviews.filter(r => r.photos && r.photos.length > 0).length }
  ];

  const averageRating = 4.8;
  const totalReviews = 127;
  const ratingDistribution = [
    { stars: 5, count: 89, percentage: 70 },
    { stars: 4, count: 25, percentage: 20 },
    { stars: 3, count: 8, percentage: 6 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 2, percentage: 2 }
  ];

  const visibleReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 2);

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              starSize,
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div id="product-reviews" className={cn("space-y-6", className)}>
      {/* Título e Resumo */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Avaliações dos Clientes
          </h3>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            Escrever avaliação
          </Button>
        </div>

        {/* Resumo das Avaliações */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Geral */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating}
              </div>
              <div className="flex items-center justify-center mb-2">
                {renderStars(Math.floor(averageRating), 'md')}
              </div>
              <div className="text-sm text-gray-600">
                Baseado em {totalReviews} avaliações
              </div>
            </div>

            {/* Distribuição de Ratings */}
            <div className="space-y-2">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm text-gray-600">{item.stars}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
        </div>
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant={selectedFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.id)}
            className={cn(
              "text-xs",
              selectedFilter === filter.id && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {filter.label} ({filter.count})
          </Button>
        ))}
      </div>

      {/* Lista de Avaliações */}
      <div className="space-y-6">
        {visibleReviews.map((review) => (
          <div
            key={review.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            {/* Header da Avaliação */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={review.user.avatar} alt={review.user.name} />
                  <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {review.user.name}
                    </span>
                    {review.user.verified && (
                      <Verified className="w-4 h-4 text-blue-600" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      {review.user.level}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(review.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                {review.verified_purchase && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Compra verificada
                  </Badge>
                )}
              </div>
            </div>

            {/* Título da Avaliação */}
            <h4 className="font-semibold text-gray-900 mb-2">
              {review.title}
            </h4>

            {/* Conteúdo */}
            <p className="text-gray-700 leading-relaxed mb-4">
              {review.content}
            </p>

            {/* Fotos da Avaliação */}
            {review.photos && review.photos.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Fotos do cliente ({review.photos.length})
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {review.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={photo}
                        alt={`Foto ${index + 1} da avaliação`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plataforma */}
            {review.platform && (
              <div className="mb-4">
                <Badge variant="outline" className="text-xs">
                  🎮 {review.platform}
                </Badge>
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Útil ({review.helpful})
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
                  <ThumbsDown className="w-4 h-4" />
                  Não útil ({review.notHelpful})
                </button>
              </div>
              <button className="text-sm text-blue-600 hover:underline">
                Responder
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Botão Ver Mais */}
      {!showAllReviews && mockReviews.length > 2 && (
        <div className="text-center">
          <Button
            onClick={() => setShowAllReviews(true)}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            Ver todas as {totalReviews} avaliações
          </Button>
        </div>
      )}

      {/* Call-to-Action */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <h5 className="font-semibold text-blue-800 mb-2">
          📝 Já comprou este produto?
        </h5>
        <p className="text-sm text-blue-700 mb-4">
          Compartilhe sua experiência e ajude outros gamers a decidir!
        </p>
        <div className="flex gap-3 justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            ⭐ Avaliar produto
          </Button>
          <Button variant="outline" className="border-blue-300 text-blue-600">
            📷 Adicionar fotos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewsWithPhotos;

