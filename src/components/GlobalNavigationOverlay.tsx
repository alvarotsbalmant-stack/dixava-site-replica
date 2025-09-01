import React, { useEffect, useState } from 'react';
import { useGlobalNavigation } from '@/contexts/GlobalNavigationContext';
import { Loader2, ArrowRight, Home, Gamepad2, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

const GlobalNavigationOverlay: React.FC = () => {
  const { navigationState } = useGlobalNavigation();
  const [showOverlay, setShowOverlay] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'loading' | 'exiting'>('entering');

  useEffect(() => {
    if (navigationState.isNavigating) {
      setShowOverlay(true);
      setAnimationPhase('entering');
      
      const timer1 = setTimeout(() => setAnimationPhase('loading'), 150);
      
      return () => clearTimeout(timer1);
    } else {
      if (showOverlay) {
        setAnimationPhase('exiting');
        const timer = setTimeout(() => {
          setShowOverlay(false);
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }
  }, [navigationState.isNavigating, showOverlay]);

  if (!showOverlay) return null;

  const getNavigationIcon = () => {
    const targetPath = navigationState.targetPath || '';
    
    if (targetPath === '/') return <Home className="w-6 h-6 text-blue-600" />;
    if (targetPath.includes('/xbox')) return <Gamepad2 className="w-6 h-6 text-green-600" />;
    if (targetPath.includes('/playstation')) return <Gamepad2 className="w-6 h-6 text-blue-600" />;
    if (targetPath.includes('/nintendo')) return <Gamepad2 className="w-6 h-6 text-red-600" />;
    if (targetPath.includes('/pc-gaming')) return <Monitor className="w-6 h-6 text-purple-600" />;
    if (targetPath.includes('/produto')) return <Smartphone className="w-6 h-6 text-orange-600" />;
    if (targetPath.includes('/busca')) return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />;
    
    return <ArrowRight className="w-6 h-6 text-gray-600" />;
  };

  const getNavigationMessage = () => {
    const targetPath = navigationState.targetPath || '';
    
    if (targetPath === '/') return 'Voltando para a página inicial...';
    if (targetPath.includes('/xbox')) return 'Carregando página Xbox...';
    if (targetPath.includes('/playstation')) return 'Carregando página PlayStation...';
    if (targetPath.includes('/nintendo')) return 'Carregando página Nintendo...';
    if (targetPath.includes('/pc-gaming')) return 'Carregando página PC Gaming...';
    if (targetPath.includes('/produto')) return 'Carregando produto...';
    if (targetPath.includes('/busca')) return 'Buscando produtos...';
    if (targetPath.includes('/categoria')) return 'Carregando categoria...';
    
    return 'Carregando página...';
  };

  const getPageName = () => {
    const targetPath = navigationState.targetPath || '';
    
    if (targetPath === '/') return 'Página Inicial';
    if (targetPath.includes('/xbox')) return 'Xbox';
    if (targetPath.includes('/playstation')) return 'PlayStation';
    if (targetPath.includes('/nintendo')) return 'Nintendo';
    if (targetPath.includes('/pc-gaming')) return 'PC Gaming';
    if (targetPath.includes('/produto')) return 'Produto';
    if (targetPath.includes('/busca')) return 'Resultados de Busca';
    if (targetPath.includes('/categoria')) return 'Categoria';
    
    return 'Nova Página';
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9998] transition-all duration-300 ease-in-out",
        "pointer-events-none", // Permite interação com a página atual
        animationPhase === 'entering' && "bg-black/0",
        animationPhase === 'loading' && "bg-black/10 backdrop-blur-[1px]",
        animationPhase === 'exiting' && "bg-black/0"
      )}
    >
      {/* Indicador de navegação no canto superior direito */}
      <div
        className={cn(
          "absolute top-4 right-4 transition-all duration-300",
          animationPhase === 'entering' && "opacity-0 scale-95 translate-y-2",
          animationPhase === 'loading' && "opacity-100 scale-100 translate-y-0",
          animationPhase === 'exiting' && "opacity-0 scale-105 -translate-y-2"
        )}
      >
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 min-w-[280px]">
          <div className="flex items-center gap-3">
            {/* Ícone da navegação */}
            <div className="flex-shrink-0">
              {getNavigationIcon()}
            </div>
            
            {/* Informações da navegação */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {getNavigationMessage()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Destino: {getPageName()}
              </div>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progresso</span>
              <span>{Math.round(navigationState.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full bg-gradient-to-r transition-all duration-300 ease-out rounded-full",
                  navigationState.targetPath?.includes('/xbox') && "from-green-500 to-green-600",
                  navigationState.targetPath?.includes('/playstation') && "from-blue-500 to-blue-600",
                  navigationState.targetPath?.includes('/nintendo') && "from-red-500 to-red-600",
                  navigationState.targetPath?.includes('/pc-gaming') && "from-purple-500 to-purple-600",
                  (!navigationState.targetPath?.includes('/xbox') && 
                   !navigationState.targetPath?.includes('/playstation') && 
                   !navigationState.targetPath?.includes('/nintendo') && 
                   !navigationState.targetPath?.includes('/pc-gaming')) && "from-gray-500 to-gray-600"
                )}
                style={{
                  width: `${Math.max(5, navigationState.progress)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Indicador sutil no centro (apenas quando progresso > 50%) */}
      {navigationState.progress > 50 && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500",
            animationPhase === 'loading' && "opacity-30",
            animationPhase !== 'loading' && "opacity-0"
          )}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-lg">
            <div className="flex items-center gap-3">
              {getNavigationIcon()}
              <div className="text-sm font-medium text-gray-700">
                Quase pronto...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalNavigationOverlay;

