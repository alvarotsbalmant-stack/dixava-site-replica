import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ChunkLoadMetric {
  chunkName: string;
  loadTime: number;
  size?: number;
  timestamp: Date;
  isAdmin: boolean;
}

interface PerformanceMetrics {
  chunkLoads: ChunkLoadMetric[];
  totalAdminLoadTime: number;
  adminChunksCount: number;
  userChunksCount: number;
}

const metrics: PerformanceMetrics = {
  chunkLoads: [],
  totalAdminLoadTime: 0,
  adminChunksCount: 0,
  userChunksCount: 0
};

export const usePerformanceMonitoring = () => {
  const { isAdmin, user } = useAuth();

  const recordChunkLoad = useCallback((chunkName: string, loadTime: number, size?: number) => {
    const metric: ChunkLoadMetric = {
      chunkName,
      loadTime,
      size,
      timestamp: new Date(),
      isAdmin: !!isAdmin
    };

    metrics.chunkLoads.push(metric);

    // Track admin-specific metrics
    if (isAdmin && chunkName.includes('admin')) {
      metrics.totalAdminLoadTime += loadTime;
      metrics.adminChunksCount++;
    } else {
      metrics.userChunksCount++;
    }

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Chunk loaded: ${chunkName} in ${loadTime}ms${size ? ` (${(size / 1024).toFixed(1)}KB)` : ''}`, {
        isAdmin,
        totalAdminTime: metrics.totalAdminLoadTime,
        adminChunks: metrics.adminChunksCount
      });
    }

    // Warn about slow admin chunks
    if (isAdmin && loadTime > 2000) {
      console.warn(`⚠️ Slow admin chunk detected: ${chunkName} took ${loadTime}ms to load`);
    }
  }, [isAdmin]);

  const getMetrics = useCallback(() => {
    const adminChunks = metrics.chunkLoads.filter(m => m.isAdmin && m.chunkName.includes('admin'));
    const userChunks = metrics.chunkLoads.filter(m => !m.chunkName.includes('admin'));
    
    return {
      ...metrics,
      adminChunks,
      userChunks,
      averageAdminLoadTime: adminChunks.length > 0 
        ? adminChunks.reduce((sum, m) => sum + m.loadTime, 0) / adminChunks.length 
        : 0,
      averageUserLoadTime: userChunks.length > 0
        ? userChunks.reduce((sum, m) => sum + m.loadTime, 0) / userChunks.length
        : 0,
      totalLoadTime: metrics.chunkLoads.reduce((sum, m) => sum + m.loadTime, 0)
    };
  }, []);

  const clearMetrics = useCallback(() => {
    metrics.chunkLoads = [];
    metrics.totalAdminLoadTime = 0;
    metrics.adminChunksCount = 0;
    metrics.userChunksCount = 0;
  }, []);

  const reportSlowChunks = useCallback(() => {
    const slowChunks = metrics.chunkLoads.filter(m => m.loadTime > 1000);
    
    if (slowChunks.length > 0) {
      console.warn('🐌 Slow chunks detected:', slowChunks.map(chunk => ({
        name: chunk.chunkName,
        time: `${chunk.loadTime}ms`,
        isAdmin: chunk.isAdmin
      })));
    }

    return slowChunks;
  }, []);

  // Monitor chunk loading performance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
          const name = entry.name;
          const duration = entry.duration;
          
          // Track JavaScript chunks
          if (name.includes('.js') && (name.includes('admin') || name.includes('vendor'))) {
            const chunkName = name.split('/').pop()?.split('.')[0] || 'unknown';
            recordChunkLoad(chunkName, duration);
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }

    return () => observer.disconnect();
  }, [recordChunkLoad]);

  // Report metrics periodically in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && user) {
      const interval = setInterval(() => {
        const currentMetrics = getMetrics();
        if (currentMetrics.chunkLoads.length > 0) {
          console.log('📊 Performance Summary:', {
            totalChunks: currentMetrics.chunkLoads.length,
            adminChunks: currentMetrics.adminChunks.length,
            userChunks: currentMetrics.userChunks.length,
            averageAdminTime: `${currentMetrics.averageAdminLoadTime.toFixed(0)}ms`,
            averageUserTime: `${currentMetrics.averageUserLoadTime.toFixed(0)}ms`,
            totalTime: `${currentMetrics.totalLoadTime.toFixed(0)}ms`
          });
        }
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user, getMetrics]);

  return {
    recordChunkLoad,
    getMetrics,
    clearMetrics,
    reportSlowChunks
  };
};

// Global performance monitoring utility
export const trackChunkLoad = (chunkName: string, startTime: number, endTime?: number) => {
  const loadTime = (endTime || performance.now()) - startTime;
  
  // Store in global metrics
  metrics.chunkLoads.push({
    chunkName,
    loadTime,
    timestamp: new Date(),
    isAdmin: window.location.pathname.includes('/admin')
  });

  if (loadTime > 1000) {
    console.warn(`⚠️ Slow chunk: ${chunkName} took ${loadTime.toFixed(0)}ms`);
  }

  return loadTime;
};