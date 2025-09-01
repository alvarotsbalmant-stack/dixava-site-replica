import React, { useState, useEffect, useRef } from 'react';
import { Coins, TrendingUp, Gift, Star, Flame, Calendar, Clock, CheckCircle, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useDailyCodes } from '@/hooks/useDailyCodes';
import { useUTICoins } from '@/contexts/UTICoinsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UTICoinsConditional } from './UTICoinsConditional';

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
  const [codeInput, setCodeInput] = useState('');
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
  
  const previousBalance = useRef(coins.balance);
  const widgetRef = useRef<HTMLButtonElement>(null);

  // Função para abrir modal e calcular posição
  const openModal = () => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      
      setModalPosition({
        top: rect.bottom + 8,
        left: rect.left + (rect.width / 2) - 200
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

  // Função para resgatar código
  const handleClaimCode = async () => {
    if (!codeInput.trim()) return;

    const result = await claimCode(codeInput.trim());
    
    if (result.success) {
      setCodeInput('');
      // Animar streak se houve mudança
      if (result.data?.streak_position) {
        setStreakAnimated(true);
        setTimeout(() => setStreakAnimated(false), 1000);
      }
      // Atualizar dados das moedas
      refreshData?.();
    }
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

  if (coinsLoading || loading) {
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
                  className="fixed bg-white rounded-xl shadow-2xl w-96 max-h-[80vh] overflow-y-auto z-[10000]"
                  style={{
                    top: `${Math.max(8, Math.min(modalPosition.top, window.innerHeight - 400))}px`,
                    left: `${Math.max(16, Math.min(modalPosition.left, window.innerWidth - 400 - 16))}px`
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

                    {/* Input para código */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Digite o código (ex: 1234)"
                          value={codeInput}
                          onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="font-mono text-center text-lg"
                          maxLength={4}
                        />
                        <Button
                          onClick={handleClaimCode}
                          disabled={codeInput.length !== 4 || claiming}
                          className="px-6"
                        >
                          {claiming ? 'Resgatando...' : 'Resgatar'}
                        </Button>
                      </div>
                      
                      {/* Streak atual */}
                      {streakStatus && (
                        <div className="flex items-center justify-between">
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
      </div>
    </UTICoinsConditional>
  );
};