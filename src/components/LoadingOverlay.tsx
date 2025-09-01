import React, { useEffect, useState } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LoadingOverlay: React.FC = () => {
  const { loadingState } = useLoading();
  const [showOverlay, setShowOverlay] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'loading' | 'exiting'>('entering');

  useEffect(() => {
    if (loadingState.isNavigating) {
      setShowOverlay(true);
      setAnimationPhase('entering');
      
      // Simular fases de carregamento
      const timer1 = setTimeout(() => setAnimationPhase('loading'), 200);
      
      return () => {
        clearTimeout(timer1);
      };
    } else {
      if (showOverlay) {
        setAnimationPhase('exiting');
        const timer = setTimeout(() => {
          setShowOverlay(false);
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }
  }, [loadingState.isNavigating, showOverlay]);

  if (!showOverlay) return null;

  const getLoadingMessage = () => {
    if (loadingState.targetPage?.includes('/busca')) {
      return 'Buscando produtos...';
    }
    if (loadingState.targetPage?.includes('/produto')) {
      return 'Carregando produto...';
    }
    return 'Carregando página...';
  };

  const getLoadingIcon = () => {
    if (loadingState.targetPage?.includes('/busca')) {
      return <Search className="w-8 h-8 text-blue-600" />;
    }
    return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] transition-all duration-300 ease-in-out",
        animationPhase === 'entering' && "bg-black/0",
        animationPhase === 'loading' && "bg-black/20 backdrop-blur-sm",
        animationPhase === 'exiting' && "bg-black/0"
      )}
    >
      {/* Overlay de carregamento */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-300",
          animationPhase === 'entering' && "opacity-0 scale-95",
          animationPhase === 'loading' && "opacity-100 scale-100",
          animationPhase === 'exiting' && "opacity-0 scale-105"
        )}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mx-4 max-w-sm w-full">
          <div className="text-center space-y-4">
            {/* Ícone de carregamento */}
            <div className="flex justify-center">
              {getLoadingIcon()}
            </div>
            
            {/* Mensagem de carregamento */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getLoadingMessage()}
              </h3>
              <p className="text-sm text-gray-600">
                Aguarde um momento...
              </p>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out",
                  "rounded-full"
                )}
                style={{
                  width: `${Math.max(10, loadingState.progress)}%`,
                  transform: loadingState.progress < 100 ? 'translateX(-100%)' : 'translateX(0%)',
                  animation: loadingState.progress < 100 ? 'loading-bar 2s ease-in-out infinite' : 'none'
                }}
              />
            </div>
            
            {/* Informação adicional */}
            {loadingState.targetPage?.includes('/busca') && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                💡 Dica: Use termos específicos para melhores resultados
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estilos CSS para animação da barra */}
      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;

