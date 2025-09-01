import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useUTICoins } from './useUTICoins';
import { UserLevel } from '@/types/retention';

// Mock data para níveis - será substituído por dados reais do Supabase
const mockLevels: UserLevel[] = [
  {
    id: '1',
    name: 'Novato',
    minCoins: 0,
    maxCoins: 499,
    color: '#94a3b8', // slate-400
    icon: '🎮',
    benefits: ['Acesso ao site', 'Suporte básico'],
    discountPercentage: 0
  },
  {
    id: '2',
    name: 'Gamer',
    minCoins: 500,
    maxCoins: 1999,
    color: '#3b82f6', // blue-500
    icon: '🎯',
    benefits: ['5% de desconto', 'Frete grátis acima de R$ 200', 'Suporte prioritário'],
    discountPercentage: 5
  },
  {
    id: '3',
    name: 'Pro Gamer',
    minCoins: 2000,
    maxCoins: 4999,
    color: '#8b5cf6', // violet-500
    icon: '⭐',
    benefits: ['10% de desconto', 'Frete grátis acima de R$ 150', 'Acesso antecipado a lançamentos'],
    discountPercentage: 10
  },
  {
    id: '4',
    name: 'Elite Gamer',
    minCoins: 5000,
    maxCoins: 9999,
    color: '#f59e0b', // amber-500
    icon: '👑',
    benefits: ['15% de desconto', 'Frete grátis sempre', 'Produtos exclusivos', 'Eventos VIP'],
    discountPercentage: 15
  },
  {
    id: '5',
    name: 'Legend Gamer',
    minCoins: 10000,
    maxCoins: Infinity,
    color: '#ef4444', // red-500
    icon: '🏆',
    benefits: ['20% de desconto', 'Frete grátis sempre', 'Acesso total', 'Consultoria pessoal'],
    discountPercentage: 20
  }
];

export const useUserLevel = () => {
  const { user } = useAuth();
  const { coins } = useUTICoins();
  const [levels] = useState<UserLevel[]>(mockLevels);

  const currentLevel = useMemo(() => {
    return levels.find(level => 
      coins.totalEarned >= level.minCoins && 
      coins.totalEarned <= level.maxCoins
    ) || levels[0];
  }, [levels, coins.totalEarned]);

  const nextLevel = useMemo(() => {
    const currentIndex = levels.findIndex(level => level.id === currentLevel.id);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  }, [levels, currentLevel]);

  const progressToNextLevel = useMemo(() => {
    if (!nextLevel) return 100;
    
    const currentProgress = coins.totalEarned - currentLevel.minCoins;
    const totalNeeded = nextLevel.minCoins - currentLevel.minCoins;
    
    return Math.min(100, (currentProgress / totalNeeded) * 100);
  }, [coins.totalEarned, currentLevel, nextLevel]);

  const coinsToNextLevel = useMemo(() => {
    if (!nextLevel) return 0;
    return Math.max(0, nextLevel.minCoins - coins.totalEarned);
  }, [coins.totalEarned, nextLevel]);

  const getLevelByCoins = (totalCoins: number): UserLevel => {
    return levels.find(level => 
      totalCoins >= level.minCoins && 
      totalCoins <= level.maxCoins
    ) || levels[0];
  };

  const getLevelBenefits = (levelId: string): string[] => {
    const level = levels.find(l => l.id === levelId);
    return level?.benefits || [];
  };

  const getDiscountForLevel = (levelId: string): number => {
    const level = levels.find(l => l.id === levelId);
    return level?.discountPercentage || 0;
  };

  return {
    levels,
    currentLevel,
    nextLevel,
    progressToNextLevel,
    coinsToNextLevel,
    getLevelByCoins,
    getLevelBenefits,
    getDiscountForLevel
  };
};

