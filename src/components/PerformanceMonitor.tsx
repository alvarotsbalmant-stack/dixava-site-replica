import React, { useEffect, useState } from 'react';
import { useIntelligentPreloader } from '@/hooks/useIntelligentPreloader';

// Componente para monitorar performance do preloading
export const PerformanceMonitor: React.FC = () => {
  const { getStats } = useIntelligentPreloader();
  const [stats, setStats] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [showMonitor, setShowMonitor] = useState(false);

  // Atualizar estatísticas periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const currentStats = getStats();
      setStats(currentStats);
      
      // Coletar métricas de performance
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const memory = (performance as any).memory;
        
        setPerformanceMetrics({
          loadTime: navigation?.loadEventEnd && navigation?.loadEventStart ? navigation.loadEventEnd - navigation.loadEventStart : null,
          domContentLoaded: navigation?.domContentLoadedEventEnd && navigation?.loadEventStart ? navigation.domContentLoadedEventEnd - navigation.loadEventStart : null,
          memoryUsed: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : null,
          memoryTotal: memory ? Math.round(memory.totalJSHeapSize / 1024 / 1024) : null,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown'
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [getStats]);

  // Mostrar monitor apenas em desenvolvimento ou com parâmetro especial
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = process.env.NODE_ENV === 'development';
    const showDebug = urlParams.get('debug') === 'performance';
    
    setShowMonitor(isDev || showDebug);
  }, []);

  if (!showMonitor || !stats) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="mb-2 font-bold text-green-400">🚀 Preloading Monitor</div>
      
      {/* Estatísticas de preloading */}
      <div className="space-y-1">
        <div>Status: {stats.isActive ? '🟢 Ativo' : '🔴 Inativo'}</div>
        <div>Preloaded: {stats.preloaded}/{stats.total}</div>
        <div>Pendentes: {stats.pending}</div>
      </div>

      {/* Rotas preloaded */}
      {stats.preloadedRoutes.length > 0 && (
        <div className="mt-2">
          <div className="text-blue-400 font-bold">Rotas Preloaded:</div>
          {stats.preloadedRoutes.map((route: string) => (
            <div key={route} className="text-green-300">✅ {route}</div>
          ))}
        </div>
      )}

      {/* Métricas de performance */}
      {performanceMetrics && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-yellow-400 font-bold">Performance:</div>
          <div>Load: {Math.round(performanceMetrics.loadTime)}ms</div>
          <div>DOM: {Math.round(performanceMetrics.domContentLoaded)}ms</div>
          {performanceMetrics.memoryUsed && (
            <div>RAM: {performanceMetrics.memoryUsed}MB/{performanceMetrics.memoryTotal}MB</div>
          )}
          <div>Conexão: {performanceMetrics.connectionType}</div>
        </div>
      )}

      {/* Controles */}
      <div className="mt-2 pt-2 border-t border-gray-600">
        <button 
          onClick={() => window.location.reload()}
          className="text-xs bg-blue-600 px-2 py-1 rounded mr-2"
        >
          Reload
        </button>
        <button 
          onClick={() => setShowMonitor(false)}
          className="text-xs bg-red-600 px-2 py-1 rounded"
        >
          Hide
        </button>
      </div>
    </div>
  );
};

// Hook para controle de throttling baseado em performance
export const usePerformanceThrottling = () => {
  const [shouldThrottle, setShouldThrottle] = useState(false);

  useEffect(() => {
    const checkPerformance = () => {
      try {
        // Verificar uso de memória
        const memory = (performance as any).memory;
        if (memory) {
          const memoryUsagePercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
          if (memoryUsagePercent > 0.8) {
            setShouldThrottle(true);
            console.warn('🚨 Throttling ativado: uso alto de memória');
            return;
          }
        }

        // Verificar performance de rede
        const connection = (navigator as any).connection;
        if (connection) {
          if (connection.effectiveType === '2g' || connection.saveData) {
            setShouldThrottle(true);
            console.warn('🚨 Throttling ativado: conexão lenta ou economia de dados');
            return;
          }
        }

        // Verificar se há muitas requisições pendentes
        const resourceEntries = performance.getEntriesByType('resource');
        const recentRequests = resourceEntries.filter(entry => 
          Date.now() - entry.startTime < 5000
        );
        
        if (recentRequests.length > 10) {
          setShouldThrottle(true);
          console.warn('🚨 Throttling ativado: muitas requisições simultâneas');
          return;
        }

        setShouldThrottle(false);
      } catch (error) {
        console.warn('Erro ao verificar performance:', error);
      }
    };

    // Verificar performance periodicamente
    const interval = setInterval(checkPerformance, 3000);
    checkPerformance(); // Verificação inicial

    return () => clearInterval(interval);
  }, []);

  return { shouldThrottle };
};

// Componente para mostrar indicador de preloading
export const PreloadingIndicator: React.FC = () => {
  // Componente desabilitado - não mostrar mais o indicador
  return null;
};

