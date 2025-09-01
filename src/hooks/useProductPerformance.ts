import { useCallback, useRef, useState } from 'react';

interface PerformanceMetrics {
  queryTime: number;
  renderTime: number;
  productCount: number;
  memoryUsage?: number;
  timestamp: number;
}

interface PerformanceMonitor {
  logQuery: (queryType: string, startTime: number, productCount: number) => void;
  logRender: (componentName: string, startTime: number) => void;
  getMetrics: () => PerformanceMetrics[];
  clearMetrics: () => void;
  getMemoryUsage: () => number | undefined;
}

export const useProductPerformance = (): PerformanceMonitor => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const renderTimesRef = useRef<Map<string, number>>(new Map());

  const logQuery = useCallback((queryType: string, startTime: number, productCount: number) => {
    const queryTime = performance.now() - startTime;
    const newMetric: PerformanceMetrics = {
      queryTime,
      renderTime: 0,
      productCount,
      memoryUsage: getMemoryUsage(),
      timestamp: Date.now()
    };

    console.log(`[Performance] ${queryType} Query:`, {
      time: `${queryTime.toFixed(2)}ms`,
      productCount,
      memoryUsage: newMetric.memoryUsage ? `${(newMetric.memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
    });

    setMetrics(prev => [...prev.slice(-9), newMetric]);
  }, []);

  const logRender = useCallback((componentName: string, startTime: number) => {
    const renderTime = performance.now() - startTime;
    renderTimesRef.current.set(componentName, renderTime);

    console.log(`[Performance] ${componentName} Render:`, {
      time: `${renderTime.toFixed(2)}ms`
    });

    setMetrics(prev => {
      const latest = prev[prev.length - 1];
      if (latest) {
        latest.renderTime = renderTime;
      }
      return [...prev];
    });
  }, []);

  const getMemoryUsage = useCallback((): number | undefined => {
    if ('memory' in performance) {
      return (performance as any).memory?.usedJSHeapSize;
    }
    return undefined;
  }, []);

  const getMetrics = useCallback(() => metrics, [metrics]);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
    renderTimesRef.current.clear();
  }, []);

  return {
    logQuery,
    logRender,
    getMetrics,
    clearMetrics,
    getMemoryUsage
  };
};