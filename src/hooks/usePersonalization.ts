import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { PersonalizationData, Recommendation } from '@/types/retention';

// Mock data para personalização - será substituído por dados reais do Supabase
const mockPersonalizationData: PersonalizationData = {
  favoriteCategories: ['RPG', 'Ação', 'Aventura'],
  preferredPlatforms: ['PlayStation', 'PC'],
  priceRange: {
    min: 50,
    max: 300
  },
  lastVisited: ['produto-1', 'produto-2', 'produto-3'],
  searchHistory: ['FIFA 24', 'God of War', 'Cyberpunk'],
  wishlist: ['produto-4', 'produto-5']
};

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    productId: 'rec-1',
    title: 'The Witcher 3: Wild Hunt',
    reason: 'Baseado no seu interesse em RPGs',
    confidence: 95,
    category: 'RPG',
    price: 89.90,
    imageUrl: '/api/placeholder/300/400'
  },
  {
    id: '2',
    productId: 'rec-2',
    title: 'Horizon Zero Dawn',
    reason: 'Outros clientes com perfil similar compraram',
    confidence: 88,
    category: 'Ação/Aventura',
    price: 129.90,
    imageUrl: '/api/placeholder/300/400'
  },
  {
    id: '3',
    productId: 'rec-3',
    title: 'Elden Ring',
    reason: 'Trending entre gamers de RPG',
    confidence: 92,
    category: 'RPG',
    price: 199.90,
    imageUrl: '/api/placeholder/300/400'
  },
  {
    id: '4',
    productId: 'rec-4',
    title: 'Spider-Man Remastered',
    reason: 'Baseado nas suas compras anteriores',
    confidence: 85,
    category: 'Ação',
    price: 149.90,
    imageUrl: '/api/placeholder/300/400'
  },
  {
    id: '5',
    productId: 'rec-5',
    title: 'Red Dead Redemption 2',
    reason: 'Recomendado para fãs de aventura',
    confidence: 90,
    category: 'Aventura',
    price: 179.90,
    imageUrl: '/api/placeholder/300/400'
  },
  {
    id: '6',
    productId: 'rec-6',
    title: 'Assassin\'s Creed Valhalla',
    reason: 'Baseado no seu histórico de navegação',
    confidence: 82,
    category: 'Ação/Aventura',
    price: 159.90,
    imageUrl: '/api/placeholder/300/400'
  }
];

export const usePersonalization = () => {
  const { user } = useAuth();
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData>(mockPersonalizationData);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [loading, setLoading] = useState(false);

  // Simular carregamento de dados de personalização
  useEffect(() => {
    if (user) {
      setLoading(true);
      // Simular delay de API
      setTimeout(() => {
        setPersonalizationData(mockPersonalizationData);
        setRecommendations(mockRecommendations);
        setLoading(false);
      }, 500);
    }
  }, [user]);

  const topRecommendations = useMemo(() => {
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  }, [recommendations]);

  const recommendationsByCategory = useMemo(() => {
    return recommendations.reduce((acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    }, {} as Record<string, Recommendation[]>);
  }, [recommendations]);

  const getRecommendationsByPriceRange = (min: number, max: number): Recommendation[] => {
    return recommendations.filter(rec => rec.price >= min && rec.price <= max);
  };

  const getRecommendationsByCategory = (category: string): Recommendation[] => {
    return recommendations.filter(rec => 
      rec.category.toLowerCase().includes(category.toLowerCase())
    );
  };

  const updatePreferences = (updates: Partial<PersonalizationData>) => {
    setPersonalizationData(prev => ({ ...prev, ...updates }));
    // Em implementação real, salvaria no backend
  };

  const trackUserAction = (action: string, metadata?: Record<string, any>) => {
    // Simular tracking de ações do usuário para melhorar recomendações
    console.log('Tracking user action:', action, metadata);
    
    // Atualizar dados de personalização baseado na ação
    if (action === 'view_product' && metadata?.category) {
      const category = metadata.category;
      setPersonalizationData(prev => ({
        ...prev,
        favoriteCategories: prev.favoriteCategories.includes(category) 
          ? prev.favoriteCategories 
          : [...prev.favoriteCategories, category].slice(-5) // Manter apenas os 5 mais recentes
      }));
    }

    if (action === 'search' && metadata?.query) {
      setPersonalizationData(prev => ({
        ...prev,
        searchHistory: [metadata.query, ...prev.searchHistory].slice(0, 10)
      }));
    }

    if (action === 'add_to_wishlist' && metadata?.productId) {
      setPersonalizationData(prev => ({
        ...prev,
        wishlist: [...prev.wishlist, metadata.productId]
      }));
    }
  };

  const getPersonalizedGreeting = (): string => {
    const hour = new Date().getHours();
    const favoriteCategory = personalizationData.favoriteCategories[0];
    
    let greeting = '';
    if (hour < 12) greeting = 'Bom dia';
    else if (hour < 18) greeting = 'Boa tarde';
    else greeting = 'Boa noite';

    if (favoriteCategory) {
      return `${greeting}! Que tal conferir os novos lançamentos de ${favoriteCategory}?`;
    }

    return `${greeting}! Descubra os melhores jogos para você!`;
  };

  const getPersonalizedBannerMessage = (): string => {
    const favoriteCategory = personalizationData.favoriteCategories[0];
    const preferredPlatform = personalizationData.preferredPlatforms[0];

    if (favoriteCategory && preferredPlatform) {
      return `Jogos de ${favoriteCategory} para ${preferredPlatform} com até 30% OFF!`;
    }

    if (favoriteCategory) {
      return `Promoção especial em jogos de ${favoriteCategory}!`;
    }

    return 'Ofertas personalizadas esperando por você!';
  };

  const shouldShowRecommendation = (recommendation: Recommendation): boolean => {
    // Verificar se a recomendação está dentro das preferências do usuário
    const { priceRange, favoriteCategories } = personalizationData;
    
    const withinPriceRange = recommendation.price >= priceRange.min && 
                            recommendation.price <= priceRange.max;
    
    const matchesCategory = favoriteCategories.some(cat => 
      recommendation.category.toLowerCase().includes(cat.toLowerCase())
    );

    return withinPriceRange || matchesCategory || recommendation.confidence > 90;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 80) return 'text-blue-600 bg-blue-50';
    if (confidence >= 70) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  return {
    personalizationData,
    recommendations,
    topRecommendations,
    recommendationsByCategory,
    loading,
    getRecommendationsByPriceRange,
    getRecommendationsByCategory,
    updatePreferences,
    trackUserAction,
    getPersonalizedGreeting,
    getPersonalizedBannerMessage,
    shouldShowRecommendation,
    getConfidenceColor
  };
};

