import { useEffect, useRef } from 'react';
import { useUTICoins } from './useUTICoins';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUTICoinsSettings } from './useUTICoinsSettings';

export const useScrollCoins = () => {
  const { user } = useAuth();
  const { earnScrollCoins } = useUTICoins();
  const { isEnabled } = useUTICoinsSettings();
  const { toast } = useToast();
  const scrollDistance = useRef<number>(0);
  const lastScrollY = useRef<number>(0);
  const isEarning = useRef<boolean>(false);

  useEffect(() => {
    // Só funcionar se o usuário estiver logado e o sistema estiver habilitado
    if (!user || !isEnabled) return;

    const handleScroll = async () => {
      // Evitar múltiplas execuções simultâneas
      if (isEarning.current) return;

      const currentScrollY = window.scrollY;
      
      // Calcular distância de scroll
      const deltaY = Math.abs(currentScrollY - lastScrollY.current);
      scrollDistance.current += deltaY;
      lastScrollY.current = currentScrollY;

      // Verificar se scrollou pelo menos 500px - backend controlará o timing
      if (scrollDistance.current > 500) {
        isEarning.current = true;
        scrollDistance.current = 0; // Reset da distância

        try {
          console.log('[SCROLL] Attempting to earn coins for scroll - backend controls timing');
          const result = await earnScrollCoins();
          
          if (result?.success) {
            toast({
              title: '🪙 UTI Coins ganhas!',
              description: `Você ganhou ${result.amount} moedas por explorar o site!`,
              duration: 3000,
            });
          } else if (result?.rateLimited) {
            // Backend controlou o timing - não mostrar erro
            console.log('[SCROLL] Backend timing control:', result.message);
          } else if (result?.suspicious) {
            toast({
              title: '⚠️ Atividade Suspeita',
              description: 'Muitas ações detectadas. Aguarde um momento.',
              variant: 'destructive',
              duration: 5000,
            });
          } else if (result?.message) {
            console.warn('[SCROLL] Action rejected:', result.message);
          }
        } catch (error) {
          console.error('[SCROLL] Error earning coins:', error);
        } finally {
          isEarning.current = false;
        }
      }
    };

    // Throttle para reduzir carga no servidor
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [user, earnScrollCoins, toast, isEnabled]);
};