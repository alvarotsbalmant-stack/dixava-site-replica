import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { Challenge } from '@/types/retention';

// Mock data para desafios - será substituído por dados reais do Supabase
const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Explorador de Gêneros',
    description: 'Compre jogos de 3 gêneros diferentes este mês',
    type: 'monthly',
    startDate: new Date(2025, 6, 1).toISOString(), // Julho 2025
    endDate: new Date(2025, 6, 31).toISOString(),
    reward: {
      coins: 300,
      badge: 'Explorador de Gêneros'
    },
    requirements: [
      {
        action: 'purchase_different_genres',
        target: 3,
        current: 1
      }
    ],
    isActive: true
  },
  {
    id: '2',
    title: 'Reviewer da Semana',
    description: 'Escreva 3 avaliações detalhadas esta semana',
    type: 'weekly',
    startDate: new Date(2025, 6, 14).toISOString(),
    endDate: new Date(2025, 6, 20).toISOString(),
    reward: {
      coins: 150,
      discount: 5
    },
    requirements: [
      {
        action: 'write_review',
        target: 3,
        current: 0
      }
    ],
    isActive: true
  },
  {
    id: '3',
    title: 'Caçador de Ofertas Diário',
    description: 'Adicione 5 produtos em promoção à sua wishlist hoje',
    type: 'daily',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    reward: {
      coins: 50
    },
    requirements: [
      {
        action: 'add_sale_item_to_wishlist',
        target: 5,
        current: 2
      }
    ],
    isActive: true
  },
  {
    id: '4',
    title: 'Maratona de Lançamentos',
    description: 'Seja um dos primeiros 100 a comprar 2 lançamentos este mês',
    type: 'special',
    startDate: new Date(2025, 6, 1).toISOString(),
    endDate: new Date(2025, 6, 31).toISOString(),
    reward: {
      coins: 500,
      badge: 'Early Adopter',
      discount: 10
    },
    requirements: [
      {
        action: 'early_purchase_new_release',
        target: 2,
        current: 0
      }
    ],
    isActive: true
  },
  {
    id: '5',
    title: 'Influenciador Social',
    description: 'Compartilhe 3 produtos nas redes sociais esta semana',
    type: 'weekly',
    startDate: new Date(2025, 6, 14).toISOString(),
    endDate: new Date(2025, 6, 20).toISOString(),
    reward: {
      coins: 100
    },
    requirements: [
      {
        action: 'social_share',
        target: 3,
        current: 1
      }
    ],
    isActive: true
  }
];

export const useChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [loading, setLoading] = useState(false);

  // Simular carregamento de desafios do usuário
  useEffect(() => {
    if (user) {
      setLoading(true);
      // Simular delay de API
      setTimeout(() => {
        setChallenges(mockChallenges);
        setLoading(false);
      }, 300);
    }
  }, [user]);

  const activeChallenges = useMemo(() => {
    const now = new Date();
    return challenges.filter(challenge => 
      challenge.isActive && 
      new Date(challenge.startDate) <= now && 
      new Date(challenge.endDate) >= now
    );
  }, [challenges]);

  const completedChallenges = useMemo(() => {
    return challenges.filter(challenge => 
      challenge.requirements.every(req => (req.current || 0) >= req.target)
    );
  }, [challenges]);

  const challengesByType = useMemo(() => {
    return activeChallenges.reduce((acc, challenge) => {
      if (!acc[challenge.type]) {
        acc[challenge.type] = [];
      }
      acc[challenge.type].push(challenge);
      return acc;
    }, {} as Record<string, Challenge[]>);
  }, [activeChallenges]);

  const getProgressPercentage = (challenge: Challenge): number => {
    const totalProgress = challenge.requirements.reduce((sum, req) => {
      return sum + ((req.current || 0) / req.target);
    }, 0);
    return Math.min(100, (totalProgress / challenge.requirements.length) * 100);
  };

  const getTimeRemaining = (challenge: Challenge): string => {
    const now = new Date();
    const endDate = new Date(challenge.endDate);
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return 'Expirado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTypeColor = (type: Challenge['type']): string => {
    const colors = {
      daily: 'text-green-600 bg-green-50',
      weekly: 'text-blue-600 bg-blue-50',
      monthly: 'text-purple-600 bg-purple-50',
      special: 'text-orange-600 bg-orange-50'
    };
    return colors[type];
  };

  const getTypeIcon = (type: Challenge['type']): string => {
    const icons = {
      daily: '📅',
      weekly: '📊',
      monthly: '🗓️',
      special: '⭐'
    };
    return icons[type];
  };

  const updateChallengeProgress = (challengeId: string, requirementIndex: number, progress: number) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? {
            ...challenge,
            requirements: challenge.requirements.map((req, index) => 
              index === requirementIndex 
                ? { ...req, current: Math.min(progress, req.target) }
                : req
            )
          }
        : challenge
    ));
  };

  const completeChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? {
            ...challenge,
            requirements: challenge.requirements.map(req => ({ ...req, current: req.target }))
          }
        : challenge
    ));
  };

  const isCompleted = (challenge: Challenge): boolean => {
    return challenge.requirements.every(req => (req.current || 0) >= req.target);
  };

  const canClaim = (challenge: Challenge): boolean => {
    return isCompleted(challenge) && challenge.isActive;
  };

  return {
    challenges,
    activeChallenges,
    completedChallenges,
    challengesByType,
    loading,
    getProgressPercentage,
    getTimeRemaining,
    getTypeColor,
    getTypeIcon,
    updateChallengeProgress,
    completeChallenge,
    isCompleted,
    canClaim
  };
};

