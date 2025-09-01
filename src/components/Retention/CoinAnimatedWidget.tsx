import React, { useState, useEffect, useRef } from 'react';
import { Coins, TrendingUp, Gift, Star, Flame, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useUTICoins } from '@/hooks/useUTICoins';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import { UTICoinsConditional } from './UTICoinsConditional';

interface UTICoinsWidgetProps {
  className?: string;
}

interface CoinAnimation {
  id: string;
  amount: number;
}

interface DailyBonusData {
  canClaim: boolean;
  currentStreak: number;
  nextBonusAmount: number;
  secondsUntilNextClaim: number;
  multiplier: number;
  nextReset: string;
  lastClaim?: string;
  testMode?: boolean;
  totalStreakDays?: number;
}

// Componente de Streak Animado estilo Duolingo
const StreakDisplay: React.FC<{ streak: number; animated?: boolean }> = ({ streak, animated = false }) => {
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    if (animated && streak >= 3) {
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 2000);
    }
  }, [animated, streak]);

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return { bg: 'bg-purple-100', text: 'text-purple-700', flame: 'text-purple-500' };
    if (streak >= 14) return { bg: 'bg-red-100', text: 'text-red-700', flame: 'text-red-500' };
    if (streak >= 7) return { bg: 'bg-orange-100', text: 'text-orange-700', flame: 'text-orange-500' };
    if (streak >= 3) return { bg: 'bg-yellow-100', text: 'text-yellow-700', flame: 'text-yellow-500' };
    return { bg: 'bg-gray-100', text: 'text-gray-700', flame: 'text-gray-500' };
  };

  const colors = getStreakColor(streak);

  return (
    <motion.div 
      className={`relative flex items-center gap-2 ${colors.bg} px-3 py-2 rounded-full border-2 border-transparent`}
      initial={animated ? { scale: 0.8, opacity: 0 } : {}}
      animate={animated ? { 
        scale: [0.8, 1.1, 1], 
        opacity: 1,
        borderColor: streak >= 7 ? ['transparent', '#f97316', 'transparent'] : 'transparent'
      } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Efeito de fogos de artifício */}
      <AnimatePresence>
        {showFireworks && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: Math.cos(i * 60 * Math.PI / 180) * 30,
                  y: Math.sin(i * 60 * Math.PI / 180) * 30,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 1,
                  delay: 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Ícone de chama animado */}
      <motion.div
        animate={animated ? { 
          rotate: [0, -15, 15, -10, 10, 0],
          scale: [1, 1.3, 1.1, 1.2, 1]
        } : streak >= 7 ? {
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ 
          duration: animated ? 1 : 2,
          ease: "easeInOut",
          repeat: streak >= 7 && !animated ? Infinity : 0,
          repeatDelay: 3
        }}
      >
        <Flame className={`w-5 h-5 ${colors.flame} drop-shadow-sm`} />
      </motion.div>

      {/* Número do streak */}
      <motion.span 
        className={`font-bold ${colors.text}`}
        initial={animated ? { y: 10, opacity: 0 } : {}}
        animate={animated ? { y: 0, opacity: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {streak} dia{streak !== 1 ? 's' : ''}
      </motion.span>

      {/* Badges especiais */}
      <AnimatePresence>
        {streak >= 30 && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full font-bold"
          >
            👑 Lenda!
          </motion.span>
        )}
        {streak >= 14 && streak < 30 && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
            className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold"
          >
            🔥 Insano!
          </motion.span>
        )}
        {streak >= 7 && streak < 14 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full"
          >
            🔥 Em chamas!
          </motion.span>
        )}
        {streak >= 3 && streak < 7 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full"
          >
            ⚡ Aquecendo!
          </motion.span>
        )}
      </AnimatePresence>

      {/* Partículas flutuantes para streaks altos */}
      <AnimatePresence>
        {streak >= 7 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-orange-400 rounded-full opacity-60"
                initial={{ 
                  x: -10 + i * 5, 
                  y: 0, 
                  scale: 0 
                }}
                animate={{ 
                  y: [-5, -15, -5],
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CoinAnimatedWidget: React.FC<UTICoinsWidgetProps> = ({ className = '' }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [coinAnimations, setCoinAnimations] = useState<CoinAnimation[]>([]);
  const [dailyBonusData, setDailyBonusData] = useState<DailyBonusData | null>(null);
  const [loadingDailyBonus, setLoadingDailyBonus] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [streakAnimated, setStreakAnimated] = useState(false);
  const { user } = useAuth();
  const { coins, transactions, loading, refreshData } = useUTICoins();
  const { toast } = useToast();
  const previousBalance = useRef(coins.balance);
  const widgetRef = useRef<HTMLButtonElement>(null);

  // Função para abrir modal e calcular posição
  const openModal = () => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      
      setModalPosition({
        top: rect.bottom + 8, // 8px de espaçamento, relativo ao viewport
        left: rect.left + (rect.width / 2) - 200 // Centralizar modal (400px / 2 = 200px)
      });
    }
    setShowPopover(true);
  };

  // Função para fechar modal com animação
  const closeModal = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowPopover(false);
      setIsExiting(false);
    }, 300); // Duração da animação de saída
  };

  // Detectar mudança no saldo para animar moedas
  useEffect(() => {
    if (previousBalance.current !== undefined && coins.balance > previousBalance.current) {
      const diff = coins.balance - previousBalance.current;
      const animationId = Date.now().toString();
      
      setCoinAnimations(prev => [...prev, { id: animationId, amount: diff }]);
      
      // Remover animação após completar
      setTimeout(() => {
        setCoinAnimations(prev => prev.filter(anim => anim.id !== animationId));
      }, 1500);
    }
    previousBalance.current = coins.balance;
  }, [coins.balance]);

  // Bloquear scroll quando modal estiver aberto
  useEffect(() => {
    if (showPopover) {
      // Salvar posição atual do scroll
      const scrollY = window.scrollY;
      
      // Bloquear scroll apenas com overflow hidden
      document.body.style.overflow = 'hidden';
      
      // Função para prevenir scroll com wheel e touch
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      // Adicionar listeners apenas para wheel e touch
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        // Restaurar scroll
        document.body.style.overflow = '';
        
        // Remover listeners
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        
        // Restaurar posição do scroll
        window.scrollTo(0, scrollY);
      };
    }
  }, [showPopover]);

  const getSecondsUntil8PM = () => {
    const now = new Date();
    const today8PM = new Date();
    today8PM.setHours(20, 0, 0, 0); // 20:00:00
    
    // Se já passou das 20h hoje, calcular para amanhã
    if (now > today8PM) {
      const tomorrow8PM = new Date(today8PM);
      tomorrow8PM.setDate(tomorrow8PM.getDate() + 1);
      return Math.floor((tomorrow8PM.getTime() - now.getTime()) / 1000);
    }
    
    // Senão, calcular para hoje
    return Math.floor((today8PM.getTime() - now.getTime()) / 1000);
  };

  // Carregar dados do daily bonus
  const loadDailyBonusData = async () => {
    try {
      if (!user) {
        setLoadingDailyBonus(false);
        return;
      }

      setLoadingDailyBonus(true);
      
      const { data, error } = await supabase.functions.invoke('secure-coin-actions', {
        body: { action: 'can_claim_daily_bonus_brasilia' }
      });

      if (error) {
        console.error('[DAILY_BONUS_WIDGET] Error loading daily bonus data:', error);
        return;
      }

      if (data?.success) {
        const currentStreak = data.validatedStreak !== undefined ? data.validatedStreak : (data.currentStreak || 1);
        
        setDailyBonusData({
          canClaim: data.canClaim || false,
          currentStreak: currentStreak,
          nextBonusAmount: data.nextBonusAmount || 10, // Usar valor do backend por enquanto
          secondsUntilNextClaim: data.secondsUntilNextClaim || 0,
          multiplier: data.multiplier || 1.0,
          nextReset: data.nextReset || "20:00",
          lastClaim: data.lastClaim,
          testMode: data.testMode || false,
          totalStreakDays: data.totalStreakDays || 7
        });
      }
    } catch (error) {
      console.error('[DAILY_BONUS_WIDGET] Exception loading daily bonus data:', error);
    } finally {
      setLoadingDailyBonus(false);
    }
  };

  // Carregar dados do daily bonus quando o popover abre
  useEffect(() => {
    if (showPopover && user) {
      loadDailyBonusData();
    }
  }, [showPopover, user]);

  // Timer em tempo real - apenas decrementar se não puder fazer claim
  useEffect(() => {
    if (!showPopover || !dailyBonusData || dailyBonusData.canClaim) return;

    const timer = setInterval(() => {
      setDailyBonusData(prev => {
        if (!prev || prev.canClaim) return prev;
        
        const newSeconds = Math.max(0, prev.secondsUntilNextClaim - 1);
        
        return {
          ...prev,
          secondsUntilNextClaim: newSeconds,
          canClaim: newSeconds <= 0
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showPopover, dailyBonusData?.canClaim]);

  // Função para resgatar daily bonus
  const claimDailyBonus = async () => {
    console.log('[DAILY_BONUS_WIDGET] claimDailyBonus called', { canClaim: dailyBonusData?.canClaim, claiming });
    if (!dailyBonusData?.canClaim || claiming) return;
    
    try {
      setClaiming(true);
      console.log('[DAILY_BONUS_WIDGET] Calling secure-coin-actions with daily_login_bonus');
      const { data, error } = await supabase.functions.invoke('secure-coin-actions', {
        body: { action: 'daily_login_bonus' }
      });

      if (error) {
        console.error('[DAILY_BONUS_WIDGET] Error claiming daily bonus:', error);
        toast({
          title: '❌ Erro',
          description: 'Erro ao resgatar bônus diário. Tente novamente.',
          variant: 'destructive',
        });
        return;
      }

      console.log('[DAILY_BONUS_WIDGET] Response from secure-coin-actions:', data);

      if (data?.success) {
        console.log('[DAILY_BONUS_WIDGET] Successfully claimed daily bonus:', data);
        toast({
          title: '🪙 Bônus Diário Resgatado!',
          description: `Você ganhou ${data.amount || 0} UTI Coins! Streak: ${data.streak || 1}`,
        });
        // Animar streak se aumentou
        if (data.streak > (dailyBonusData.currentStreak || 0)) {
          setStreakAnimated(true);
          setTimeout(() => setStreakAnimated(false), 1000);
        }

        // Calcular próximo tempo para 20h do dia seguinte
        const now = new Date();
        const tomorrow8PM = new Date();
        tomorrow8PM.setDate(tomorrow8PM.getDate() + 1);
        tomorrow8PM.setHours(20, 0, 0, 0);
        const secondsUntilNext = Math.floor((tomorrow8PM.getTime() - now.getTime()) / 1000);

        // Atualizar dados locais imediatamente
        setDailyBonusData(prev => prev ? {
          ...prev,
          canClaim: false,
          currentStreak: data.streak || prev.currentStreak,
          multiplier: data.multiplier || prev.multiplier,
          secondsUntilNextClaim: secondsUntilNext,
          lastClaim: new Date().toISOString()
        } : null);
        
        // Atualizar dados do parent
        refreshData?.();
        // Recarregar dados após o claim para sincronizar com backend
        setTimeout(() => loadDailyBonusData(), 2000);
      } else {
        console.error('[DAILY_BONUS_WIDGET] Error response from secure-coin-actions:', data);
        toast({
          title: '❌ Erro',
          description: data?.message || 'Erro ao resgatar bônus diário.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[DAILY_BONUS_WIDGET] Error claiming daily bonus:', error);
    } finally {
      setClaiming(false);
    }
  };

  // Formatar tempo restante
  const formatSecondsToTime = (seconds: number) => {
    if (seconds <= 0) return 'Disponível agora';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  // Calcular nível baseado no total de moedas ganhas
  const calculateLevel = (totalEarned: number) => {
    if (totalEarned < 100) return { 
      level: 1, 
      name: "Bronze", 
      color: "#CD7F32", 
      progress: totalEarned, 
      nextThreshold: 100,
      nextLevelName: "Silver"
    };
    if (totalEarned < 500) return { 
      level: 2,
      name: "Silver", 
      color: "#C0C0C0", 
      progress: totalEarned - 100, 
      nextThreshold: 400,
      nextLevelName: "Gold"
    };
    if (totalEarned < 1500) return { 
      level: 3,
      name: "Gold", 
      color: "#FFD700", 
      progress: totalEarned - 500, 
      nextThreshold: 1000,
      nextLevelName: "Platinum"
    };
    if (totalEarned < 3000) return { 
      level: 4,
      name: "Platinum", 
      color: "#E5E4E2", 
      progress: totalEarned - 1500, 
      nextThreshold: 1500,
      nextLevelName: "Diamond"
    };
    return { 
      level: 5,
      name: "Diamond", 
      color: "#B9F2FF", 
      progress: 100, 
      nextThreshold: 0,
      nextLevelName: "Max"
    };
  };

  const levelData = calculateLevel(coins.totalEarned);
  const progressPercentage = levelData.nextThreshold > 0 ? (levelData.progress / levelData.nextThreshold) * 100 : 100;
  
  const recentTransactions = transactions.slice(0, 3).map(t => ({
    action: t.description,
    amount: t.type === 'earned' ? t.amount : -t.amount,
    date: new Date(t.createdAt).toLocaleDateString('pt-BR'),
    type: t.type
  }));

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg opacity-50">
          <Coins className="w-4 h-4 animate-spin" />
          <span className="font-semibold">...</span>
          <span className="text-xs opacity-90">UTI Coins</span>
        </div>
      </div>
    );
  }

  return (
    <UTICoinsConditional>
    <div className={`relative ${className}`}>
      <button
        ref={widgetRef}
        onClick={openModal}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg relative overflow-hidden"
      >
        <Coins className="w-4 h-4" />
        <div className="relative">
          <motion.span 
            key={coins.balance}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-semibold"
          >
            {coins.balance.toLocaleString()}
          </motion.span>
          
          {/* Animações de moedas caindo */}
          <AnimatePresence>
            {coinAnimations.map((animation) => (
              <motion.div
                key={animation.id}
                initial={{ y: -20, x: 0, opacity: 1, scale: 1 }}
                animate={{ y: 30, x: Math.random() * 20 - 10, opacity: 0, scale: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
              >
                <div className="flex items-center gap-1 text-yellow-200 font-bold text-sm">
                  <Coins className="w-3 h-3" />
                  +{animation.amount}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <span className="text-xs opacity-90">UTI Coins</span>
      </button>

      {/* Modal Portal com posicionamento relativo ao widget */}
      {createPortal(
        <AnimatePresence>
          {showPopover && (
            <motion.div
              key="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: isExiting ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 bg-black bg-opacity-50 z-[9999]"
              onClick={closeModal}
            >
              {/* Modal posicionado abaixo do widget */}
              <motion.div
                key="modal-content"
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ 
                  opacity: isExiting ? 0 : 1, 
                  scale: isExiting ? 0.8 : 1, 
                  y: isExiting ? -20 : 0 
                }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeInOut"
                }}
                className="fixed bg-white rounded-xl shadow-2xl w-96 max-h-[80vh] overflow-y-auto z-[10000]"
                style={{
                  top: `${Math.max(8, Math.min(modalPosition.top, window.innerHeight - 400))}px`, // Garantir que não saia da tela
                  left: `${Math.max(16, Math.min(modalPosition.left, window.innerWidth - 400 - 16))}px` // Garantir que não saia da tela
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{coins.balance.toLocaleString()} UTI Coins</h3>
                      <p className="text-sm opacity-90">Nível {levelData.level} - {levelData.name}</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-200" />
                  </div>
                  
                  {/* Barra de progresso */}
                  {levelData.nextThreshold > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Próximo nível: {levelData.nextLevelName}</span>
                        <span>{levelData.nextThreshold - levelData.progress} coins restantes</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Daily Bonus Section */}
                <div className="p-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Recompensa Diária
                    {dailyBonusData?.testMode && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-normal">
                        TESTE (60s)
                      </span>
                    )}
                  </h4>
                  
                  {loadingDailyBonus ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  ) : dailyBonusData ? (
                    <div className="space-y-3">
                      {/* Streak Display */}
                      <div className="flex items-center justify-between">
                        <StreakDisplay 
                          streak={dailyBonusData.currentStreak} 
                          animated={streakAnimated}
                        />
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">
                            +{dailyBonusData.currentStreak === 1 ? 30 : 
                              dailyBonusData.currentStreak === 2 ? 37 :
                              dailyBonusData.currentStreak === 3 ? 43 :
                              dailyBonusData.currentStreak === 4 ? 50 :
                              dailyBonusData.currentStreak === 5 ? 57 :
                              dailyBonusData.currentStreak === 6 ? 63 :
                              dailyBonusData.currentStreak === 7 ? 70 :
                              30 + Math.round(((70 - 30) * ((dailyBonusData.currentStreak % 7 || 7) - 1)) / 6)
                            } UTI Coins
                          </div>
                          <div className="text-xs text-gray-500">
                            Próximo bônus
                          </div>
                        </div>
                      </div>

                      {/* Status e Timer */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {dailyBonusData.canClaim ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-green-700">
                                  Disponível agora!
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4 text-gray-500" />
                                <div className="flex flex-col">
                                  <span className="text-sm text-gray-600">
                                    Próximo em
                                  </span>
                                  <motion.span 
                                    key={dailyBonusData.secondsUntilNextClaim}
                                    initial={{ scale: 1.1, color: "#3B82F6" }}
                                    animate={{ scale: 1, color: "#6B7280" }}
                                    transition={{ duration: 0.3 }}
                                    className="text-xs font-mono font-bold"
                                  >
                                    {formatSecondsToTime(dailyBonusData.secondsUntilNextClaim)}
                                  </motion.span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <button
                            onClick={claimDailyBonus}
                            disabled={!dailyBonusData.canClaim || claiming}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                              dailyBonusData.canClaim && !claiming
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {claiming ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                Resgatando...
                              </div>
                            ) : dailyBonusData.canClaim ? (
                              'Resgatar'
                            ) : (
                              'Aguardar'
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Erro ao carregar dados do bônus diário
                    </div>
                  )}
                </div>

                {/* Transações Recentes */}
                <div className="p-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Transações Recentes
                  </h4>
                  
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-2">
                      {recentTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div>
                              <div className="text-sm font-medium text-gray-700">
                                {transaction.action}
                              </div>
                              <div className="text-xs text-gray-500">
                                {transaction.date}
                              </div>
                            </div>
                          </div>
                          <div className={`font-semibold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Nenhuma transação recente
                    </div>
                  )}
                </div>

                {/* Estatísticas */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {coins.totalEarned.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total Ganho</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">
                        {coins.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total Gasto</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
    </UTICoinsConditional>
  );
};

