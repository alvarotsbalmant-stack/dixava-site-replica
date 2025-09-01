import { useEffect } from 'react';

interface ImageMetrics {
  url: string;
  loadTime: number;
  size?: number;
  wasLazy: boolean;
  timestamp: number;
}

class ImagePerformanceTracker {
  private static instance: ImagePerformanceTracker;
  private metrics: ImageMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): ImagePerformanceTracker {
    if (!ImagePerformanceTracker.instance) {
      ImagePerformanceTracker.instance = new ImagePerformanceTracker();
    }
    return ImagePerformanceTracker.instance;
  }

  startTracking() {
    // Track resource timing for images
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.initiatorType === 'img' && entry.name.includes('http')) {
            this.recordMetric({
              url: entry.name,
              loadTime: resourceEntry.responseEnd - resourceEntry.startTime,
              size: resourceEntry.transferSize,
              wasLazy: resourceEntry.startTime > 1000, // Rough estimation
              timestamp: Date.now(),
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  recordMetric(metric: ImageMetrics) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log performance issues
    if (metric.loadTime > 3000) {
      console.warn(`Slow image loading detected: ${metric.url} took ${metric.loadTime}ms`);
    }
  }

  getMetrics(): ImageMetrics[] {
    return [...this.metrics];
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.loadTime, 0);
    return total / this.metrics.length;
  }

  getLazyLoadingEfficiency(): number {
    if (this.metrics.length === 0) return 0;
    const lazyLoaded = this.metrics.filter(m => m.wasLazy).length;
    return (lazyLoaded / this.metrics.length) * 100;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

/**
 * Hook para monitoramento de performance de imagens
 */
export const useImagePerformanceMonitor = (enabled: boolean = process.env.NODE_ENV === 'development') => {
  useEffect(() => {
    if (!enabled) return;

    const tracker = ImagePerformanceTracker.getInstance();
    tracker.startTracking();

    // Log metrics every 30 seconds in development
    const interval = setInterval(() => {
      const metrics = tracker.getMetrics();
      if (metrics.length > 0) {
        console.group('🖼️ Image Performance Metrics');
        console.log(`Average load time: ${tracker.getAverageLoadTime().toFixed(2)}ms`);
        console.log(`Lazy loading efficiency: ${tracker.getLazyLoadingEfficiency().toFixed(1)}%`);
        console.log(`Total images tracked: ${metrics.length}`);
        
        // Show slowest images
        const slowest = metrics
          .sort((a, b) => b.loadTime - a.loadTime)
          .slice(0, 3);
        
        if (slowest.length > 0) {
          console.log('Slowest images:');
          slowest.forEach(m => {
            console.log(`  ${m.url.split('/').pop()}: ${m.loadTime.toFixed(2)}ms`);
          });
        }
        console.groupEnd();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      tracker.cleanup();
    };
  }, [enabled]);

  return ImagePerformanceTracker.getInstance();
};

/**
 * Componente para mostrar métricas de performance em desenvolvimento
 */
export const ImagePerformanceDebugger = () => {
  const tracker = useImagePerformanceMonitor();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      🖼️ Avg Load: {tracker.getAverageLoadTime().toFixed(0)}ms | 
      Lazy: {tracker.getLazyLoadingEfficiency().toFixed(0)}%
    </div>
  );
};
