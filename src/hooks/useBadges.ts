import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useUTICoins } from './useUTICoins';
import { UserBadge } from '@/types/retention';

// Mock data para badges - será substituído por dados reais do Supabase
const mockBadges: UserBadge[] = [
  {
    id: '1',
    name: 'Primeiro Comprador',
    description: 'Fez sua primeira compra na UTI Games',
    icon: '🛒',
    rarity: 'bronze',
    unlockedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Colecionador de RPGs',
    description: 'Comprou 5 jogos de RPG',
    icon: '⚔️',
    rarity: 'silver',
    progress: 2,
    maxProgress: 5
  },
  {
    id: '3',
    name: 'Reviewer Ativo',
    description: 'Escreveu 10 avaliações de produtos',
    icon: '⭐',
    rarity: 'gold',
    progress: 3,
    maxProgress: 10
  },
  {
    id: '4',
    name: 'Caçador de Ofertas',
    description: 'Comprou durante 3 promoções diferentes',
    icon: '🎯',
    rarity: 'silver',
    progress: 1,
    maxProgress: 3
  },
  {
    id: '5',
    name: 'Fã de Retro Gaming',
    description: 'Comprou 3 jogos clássicos',
    icon: '🕹️',
    rarity: 'bronze',
    progress: 0,
    maxProgress: 3
  },
  {
    id: '6',
    name: 'Influenciador',
    description: 'Indicou 5 amigos que fizeram compras',
    icon: '📢',
    rarity: 'gold',
    progress: 0,
    maxProgress: 5
  },
  {
    id: '7',
    name: 'Veterano UTI',
    description: 'Cliente há mais de 1 ano',
    icon: '🏆',
    rarity: 'platinum',
    progress: 0,
    maxProgress: 1
  },
  {
    id: '8',
    name: 'Explorador de Plataformas',
    description: 'Comprou jogos para 4 plataformas diferentes',
    icon: '🎮',
    rarity: 'silver',
    progress: 2,
    maxProgress: 4
  },
  {
    id: '9',
    name: 'Madrugador',
    description: 'Comprou um lançamento no primeiro dia',
    icon: '🌅',
    rarity: 'gold',
    progress: 0,
    maxProgress: 1
  },
  {
    id: '10',
    name: 'Colecionador Master',
    description: 'Possui mais de 50 jogos',
    icon: '👑',
    rarity: 'platinum',
    progress: 12,
    maxProgress: 50
  }
];

export const useBadges = () => {
  const { user } = useAuth();
  const { coins } = useUTICoins();
  const [badges, setBadges] = useState<UserBadge[]>(mockBadges);
  const [loading, setLoading] = useState(false);

  // Simular carregamento de badges do usuário
  useEffect(() => {
    if (user) {
      setLoading(true);
      // Simular delay de API
      setTimeout(() => {
        setBadges(mockBadges);
        setLoading(false);
      }, 300);
    }
  }, [user]);

  const unlockedBadges = useMemo(() => {
    return badges.filter(badge => badge.unlockedAt);
  }, [badges]);

  const availableBadges = useMemo(() => {
    return badges.filter(badge => !badge.unlockedAt);
  }, [badges]);

  const badgesByRarity = useMemo(() => {
    return badges.reduce((acc, badge) => {
      if (!acc[badge.rarity]) {
        acc[badge.rarity] = [];
      }
      acc[badge.rarity].push(badge);
      return acc;
    }, {} as Record<string, UserBadge[]>);
  }, [badges]);

  const getProgressPercentage = (badge: UserBadge): number => {
    if (!badge.maxProgress || badge.unlockedAt) return 100;
    return Math.min(100, ((badge.progress || 0) / badge.maxProgress) * 100);
  };

  const getRarityColor = (rarity: UserBadge['rarity']): string => {
    const colors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2'
    };
    return colors[rarity];
  };

  const getRarityGradient = (rarity: UserBadge['rarity']): string => {
    const gradients = {
      bronze: 'from-amber-600 to-orange-700',
      silver: 'from-slate-400 to-slate-600',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-purple-400 to-purple-600'
    };
    return gradients[rarity];
  };

  const checkBadgeProgress = (action: string, metadata?: Record<string, any>) => {
    // Simular verificação de progresso de badges
    // Em implementação real, isso seria feito no backend
    console.log('Checking badge progress for action:', action, metadata);
  };

  const unlockBadge = (badgeId: string) => {
    setBadges(prev => prev.map(badge => 
      badge.id === badgeId 
        ? { ...badge, unlockedAt: new Date().toISOString() }
        : badge
    ));
  };

  const updateBadgeProgress = (badgeId: string, progress: number) => {
    setBadges(prev => prev.map(badge => 
      badge.id === badgeId 
        ? { ...badge, progress: Math.min(progress, badge.maxProgress || progress) }
        : badge
    ));
  };

  return {
    badges,
    unlockedBadges,
    availableBadges,
    badgesByRarity,
    loading,
    getProgressPercentage,
    getRarityColor,
    getRarityGradient,
    checkBadgeProgress,
    unlockBadge,
    updateBadgeProgress
  };
};

