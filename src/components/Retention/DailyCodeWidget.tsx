import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Coins, TrendingUp, Gift, Star, Flame, Calendar, Clock, CheckCircle, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDailyCodes } from '@/hooks/useDailyCodes';
import { useUTICoins } from '@/contexts/UTICoinsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { UTICoinsConditional } from './UTICoinsConditional';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUIState } from '@/contexts/UIStateContext';

interface UTICoinsWidgetProps {
  className?: string;
}

interface CoinAnimation {
  id: string;
  amount: number;
}

// Componente de Streak Animado para o novo sistema
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
    </motion.div>
  );
};

export const DailyCodeWidget: React.FC<UTICoinsWidgetProps> = ({ className = '' }) => {
  const [showPopover, setShowPopover] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [coinAnimations, setCoinAnimations] = useState<CoinAnimation[]>([]);
  const [streakAnimated, setStreakAnimated] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  const { user } = useAuth();
  const { coins, loading: coinsLoading, refreshData } = useUTICoins();
  const { 
    loading, 
    currentCode, 
    streakStatus, 
    claiming, 
    claimCode, 
    refreshData: refreshCodes,
    getTimeUntilNextCode 
  } = useDailyCodes();
  
  const isMobileHook = useIsMobile();
  const [isMobileStable, setIsMobileStable] = useState(isMobileHook);
  const { shouldHideWidget } = useUIState();
  
  // Estabilizar isMobile - uma vez mobile, sempre mobile durante a sessão
  useEffect(() => {
    if (isMobileHook && !isMobileStable) {
      setIsMobileStable(true);
    }
  }, [isMobileHook, isMobileStable]);
  
  const isMobile = isMobileStable;
  const previousBalance = useRef(coins.balance);
  const widgetRef = useRef<HTMLButtonElement>(null);

  // Função para abrir modal e calcular posição
  const openModal = () => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      
      setModalPosition({
        top: rect.bottom + 8,
        left: isMobile ? 0 : rect.left + (rect.width / 2) - 200
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
    }, 300);
  };

  // Detectar mudança no saldo para animar moedas
  useEffect(() => {
    if (previousBalance.current !== undefined && coins.balance > previousBalance.current) {
      const diff = coins.balance - previousBalance.current;
      const animationId = Date.now().toString();
      
      setCoinAnimations(prev => [...prev, { id: animationId, amount: diff }]);
      
      setTimeout(() => {
        setCoinAnimations(prev => prev.filter(anim => anim.id !== animationId));
      }, 1500);
    }
    previousBalance.current = coins.balance;
  }, [coins.balance]);

  // Timer para próximo código
  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilNext(getTimeUntilNextCode());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [getTimeUntilNextCode]);

  // Bloquear scroll quando modal estiver aberto
  useEffect(() => {
    if (showPopover) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        window.scrollTo(0, scrollY);
      };
    }
  }, [showPopover]);

  // Função para resgatar código automaticamente
  const handleClaimCode = async () => {
    // Buscar o código do dia atual automaticamente
    if (!currentCode?.code) {
      console.error('[DAILY_BONUS] No current code available');
      return;
    }

    console.log(`[DAILY_BONUS] Auto-claiming code: ${currentCode.code}`);
    const result = await claimCode(currentCode.code);
    
    if (result.success) {
      // Animar streak se houve mudança
      if (result.data?.streak_position) {
        setStreakAnimated(true);
        setTimeout(() => setStreakAnimated(false), 1000);
      }
      // Atualizar dados das moedas
      refreshData?.();
    }
  };

  // Calcular recompensa baseado na configuração real do sistema (ANTES de ser usada)
  const calculateRewardFromStreak = useCallback((streakDay: number) => {
    // Configuração do sistema: 30 (base) a 70 (máx) em 7 dias com progressão linear
    const baseAmount = 30;
    const maxAmount = 70;
    const streakDays = 7;
    
    if (streakDay <= 0) return baseAmount;
    if (streakDay >= streakDays) return maxAmount;
    
    // Progressão linear: 30, 37, 43, 50, 57, 63, 70
    const increment = (maxAmount - baseAmount) / (streakDays - 1);
    return Math.round(baseAmount + ((streakDay - 1) * increment));
  }, []);

  // Buscar próxima recompensa do backend com configurações corretas
  const [nextRewardAmount, setNextRewardAmount] = useState<number>(30); // Base amount correto
  
  const fetchNextRewardAmount = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('[DAILY_BONUS] Fetching next reward amount...');
      const { data, error } = await supabase.functions.invoke('secure-coin-actions', {
        body: { action: 'can_claim_daily_bonus_brasilia' }
      });
      
      console.log('[DAILY_BONUS] Backend response:', data);
      
      if (!error && data?.success) {
        if (data.nextBonusAmount) {
          console.log('[DAILY_BONUS] Setting next reward amount to:', data.nextBonusAmount);
          setNextRewardAmount(data.nextBonusAmount);
        } else {
          console.warn('[DAILY_BONUS] No nextBonusAmount in response, using current streak calculation');
          // Fallback: calcular baseado na streak atual e configuração do sistema
          const currentStreak = data.currentStreak || streakStatus?.streak_count || 0;
          const calculatedAmount = calculateRewardFromStreak(currentStreak + 1); // Próximo dia
          console.log('[DAILY_BONUS] Calculated amount from streak', currentStreak + 1, ':', calculatedAmount);
          setNextRewardAmount(calculatedAmount);
        }
      }
    } catch (error) {
      console.error('[DAILY_BONUS] Error fetching next reward amount:', error);
    }
  }, [user, streakStatus?.streak_count, calculateRewardFromStreak]);

  // Carregar próxima recompensa na inicialização e depois de resgatar
  useEffect(() => {
    fetchNextRewardAmount();
  }, [fetchNextRewardAmount]);

  // Atualizar valor após resgate
  useEffect(() => {
    if (user) {
      fetchNextRewardAmount();
    }
  }, [streakStatus?.streak_count, user, fetchNextRewardAmount]);

  // Calcular coins da próxima recompensa (usa valor do backend ou cálculo)
  const calculateNextReward = () => {
    // Se não tem streak, usar valor base
    if (!streakStatus?.streak_count) return 30;
    
    // Calcular baseado no PRÓXIMO dia (não no atual)
    const currentStreak = streakStatus.streak_count;
    const baseAmount = 30;
    const maxAmount = 70;
    const streakDays = 7;
    
    // Próxima posição no ciclo (dia seguinte)
    const nextStreakPosition = Math.max(1, (currentStreak % streakDays) + 1);
    
    // Se chegou ao final do ciclo, volta para o dia 1
    const finalPosition = nextStreakPosition > streakDays ? 1 : nextStreakPosition;
    
    // Progressão linear: 30, 37, 43, 50, 57, 63, 70
    const increment = (maxAmount - baseAmount) / (streakDays - 1);
    return Math.round(baseAmount + ((finalPosition - 1) * increment));
  };

  // Verificar se já resgatou o código do dia
  const hasClaimedToday = () => {
    if (!streakStatus?.codes || streakStatus.codes.length === 0) return false;
    
    const today = new Date().toDateString();
    return streakStatus.codes.some(code => {
      const codeDate = new Date(code.added_at).toDateString();
      return codeDate === today;
    });
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

  // Ocultar widget em mobile quando há interferência na UX
  if (isMobile && shouldHideWidget()) {
    return null;
  }

  if (coinsLoading || loading) {
    const loadingContent = (
      <div className={`${isMobile ? 'fixed top-4 right-4 z-50' : 'relative mr-2 sm:mr-0'} ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg opacity-50">
          <Coins className="w-4 h-4 animate-spin" />
          <span className="font-semibold">...</span>
          <span className="text-xs opacity-90">UTI Coins</span>
        </div>
      </div>
    );

    return (
      <UTICoinsConditional>
        {isMobile ? createPortal(loadingContent, document.body) : loadingContent}
      </UTICoinsConditional>
    );
  }

  // Renderizar widget independente em mobile usando portal
  const widgetContent = (
    <div className={`${isMobile ? 'fixed top-4 right-4 z-50' : 'relative mr-2 sm:mr-0'} ${className}`}>
      <button
        ref={widgetRef}
        onClick={openModal}
        className="flex items-center gap-2 sm:gap-2 px-3 sm:px-3 py-2 sm:py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg relative overflow-hidden"
      >
          <Coins className="w-4 h-4 sm:w-4 sm:h-4" />
          <div className="relative">
            <motion.span 
              key={coins.balance}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="font-semibold text-sm sm:text-sm"
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
      </div>
    );

    // Em mobile, renderizar independente usando portal
    return (
      <UTICoinsConditional>
        {isMobile ? createPortal(widgetContent, document.body) : widgetContent}

        {/* Modal Portal */}
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
                  className="fixed bg-white rounded-xl shadow-2xl w-[calc(100vw-2rem)] sm:w-96 max-h-[80vh] overflow-y-auto z-[10000]"
                  style={{
                    top: `${Math.max(8, Math.min(modalPosition.top, window.innerHeight - 400))}px`,
                    left: window.innerWidth < 640 ? '1rem' : `${Math.max(16, Math.min(modalPosition.left, window.innerWidth - 400 - 16))}px`
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

                  {/* Daily Codes Section */}
                  <div className="p-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-500" />
                      Códigos Diários
                    </h4>
                    
                    {/* Status do código atual */}
                    {currentCode ? (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-blue-500" />
                            <span className="font-mono text-lg font-bold text-blue-700">
                              {currentCode.code}
                            </span>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            currentCode.can_claim 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {currentCode.can_claim ? 'Pode resgatar' : 'Expirado para resgate'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {currentCode.can_claim 
                            ? `Válido por mais ${currentCode.hours_until_claim_expires}h` 
                            : `Ainda mantém streak por ${currentCode.hours_until_validity_expires}h`
                          }
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3 text-center">
                        <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-600">
                          Próximo código em:
                        </div>
                        <div className="font-mono text-lg font-bold text-gray-800">
                          {timeUntilNext.hours.toString().padStart(2, '0')}:
                          {timeUntilNext.minutes.toString().padStart(2, '0')}:
                          {timeUntilNext.seconds.toString().padStart(2, '0')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Próximo código será gerado às 20h
                        </div>
                      </div>
                    )}

                    {/* Sistema melhorado de resgate */}
                    <div className="space-y-3">
                      {currentCode?.can_claim ? (
                        /* Pode resgatar - Mostrar botão de resgatar */
                        <div className="text-center space-y-4">
                          <div className="flex items-center justify-center gap-2 text-emerald-600">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium">Recompensa Disponível</span>
                          </div>
                          
                          {/* Valor dinâmico da recompensa */}
                          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Coins className="w-5 h-5 text-emerald-600" />
                              <span className="text-2xl font-bold text-emerald-700">
                                +{calculateNextReward()}
                              </span>
                              <span className="text-emerald-600 font-medium">UTI Coins</span>
                            </div>
                            {streakStatus && streakStatus.streak_count > 0 && (
                              <div className="text-xs text-emerald-600 font-medium">
                                Multiplicador {((calculateNextReward() / 15) * 1).toFixed(1)}x pela streak de {streakStatus.streak_count} dias
                              </div>
                            )}
                          </div>

                          {/* Botão estético melhorado */}
                          <Button
                            onClick={handleClaimCode}
                            disabled={claiming}
                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {claiming ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Resgatando...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Gift className="w-4 h-4" />
                                Resgatar Recompensa
                              </div>
                            )}
                          </Button>
                          
                          {currentCode.hours_until_claim_expires > 0 && (
                            <p className="text-xs text-gray-500">
                              Válido por mais {currentCode.hours_until_claim_expires}h
                            </p>
                          )}
                        </div>
                      ) : (
                        /* Não pode resgatar - Mostrar timer */
                        <div className="text-center space-y-4">
                          <div className="flex items-center justify-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Recompensa não disponível
                            </span>
                          </div>
                          
                          {/* Timer até próxima recompensa */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                            <div className="text-sm text-blue-600 font-medium mb-2">
                              Próxima recompensa em:
                            </div>
                            <div className="text-2xl font-mono font-bold text-blue-700 mb-2">
                              {timeUntilNext.hours.toString().padStart(2, '0')}:
                              {timeUntilNext.minutes.toString().padStart(2, '0')}:
                              {timeUntilNext.seconds.toString().padStart(2, '0')}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <Coins className="w-4 h-4 text-blue-600" />
                              <span className="text-lg font-semibold text-blue-700">
                                +{calculateNextReward()} UTI Coins
                              </span>
                            </div>
                            <div className="text-xs text-blue-500 mt-1">
                              Disponível às 20h
                            </div>
                          </div>

                          <Button
                            disabled
                            className="w-full bg-gray-100 text-gray-400 font-medium py-3 px-6 rounded-xl cursor-not-allowed border border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Aguardar até amanhã
                            </div>
                          </Button>
                        </div>
                      )}
                      
                      {/* Streak atual - Design original restaurado */}
                      {streakStatus && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <StreakDisplay 
                            streak={streakStatus.streak_count} 
                            animated={streakAnimated}
                          />
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">
                              {streakStatus.valid_codes_count} código{streakStatus.valid_codes_count !== 1 ? 's' : ''} válido{streakStatus.valid_codes_count !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              Mantendo streak ativa
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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
      </UTICoinsConditional>
    );
};