import React from 'react';
import { Coins } from 'lucide-react';
import { useUTICoins } from '@/contexts/UTICoinsContext';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface UTICoinsMobileWidgetProps {
  onClick?: () => void;
  className?: string;
}

export const UTICoinsMobileWidget = ({ onClick, className }: UTICoinsMobileWidgetProps) => {
  const { coins, loading } = useUTICoins();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Só renderiza no mobile e se o usuário estiver logado
  if (!isMobile || !user) return null;

  const formatCoins = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString('pt-BR');
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95",
        className
      )}
    >
      <Coins className="w-4 h-4 text-white" />
      <span className="text-sm font-semibold">
        {loading ? '...' : formatCoins(coins.balance || 0)}
      </span>
    </button>
  );
};

