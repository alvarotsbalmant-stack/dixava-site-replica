/**
 * Integration hook for coordinating all scroll-related systems
 * Prevents conflicts between sticky elements, horizontal scroll, and scroll coins
 */

import { useEffect } from 'react';
import { scrollCoordinator } from '@/lib/scrollCoordinator';
import horizontalScrollManager from '@/lib/horizontalScrollManager';
import { useLocation } from 'react-router-dom';

interface ScrollSystemConfig {
  enabledSystems: {
    sticky: boolean;
    horizontal: boolean;
    coins: boolean;
    restoration: boolean;
  };
  performanceMode: 'smooth' | 'performance' | 'battery';
}

export const useScrollSystemIntegration = (config?: Partial<ScrollSystemConfig>) => {
  const location = useLocation();

  const defaultConfig: ScrollSystemConfig = {
    enabledSystems: {
      sticky: true,
      horizontal: true,
      coins: true,
      restoration: true
    },
    performanceMode: 'smooth'
  };

  const finalConfig = { ...defaultConfig, ...config };

  useEffect(() => {
    // Register horizontal scroll manager with coordinator
    if (finalConfig.enabledSystems.horizontal) {
      scrollCoordinator.registerSystem('horizontal-scroll', (scrollY) => {
        // Horizontal scroll manager handles its own logic internally
        // Just notify it of page changes
      }, {
        priority: 3,
        throttleMs: 16 // 60fps for smooth horizontal scrolling
      });
    }

    // Register scroll coins system if enabled
    if (finalConfig.enabledSystems.coins) {
      scrollCoordinator.registerSystem('scroll-coins', (scrollY) => {
        // This will be handled by the scroll coins hook itself
        // We just reserve the slot here
      }, {
        priority: 1, // Lowest priority for non-visual features
        throttleMs: 100 // Lower frequency for coins
      });
    }

    // Performance optimizations based on mode
    switch (finalConfig.performanceMode) {
      case 'performance':
        // Reduce update frequencies for better performance
        scrollCoordinator.registerSystem('performance-mode', () => {}, {
          priority: 0,
          throttleMs: 32 // 30fps
        });
        break;
      
      case 'battery':
        // Even lower frequencies for battery saving
        scrollCoordinator.registerSystem('battery-mode', () => {}, {
          priority: 0,
          throttleMs: 50 // 20fps
        });
        break;
      
      case 'smooth':
      default:
        // Default smooth scrolling (handled by individual systems)
        break;
    }

    return () => {
      // Cleanup registrations
      if (finalConfig.enabledSystems.horizontal) {
        scrollCoordinator.unregisterSystem('horizontal-scroll');
      }
      if (finalConfig.enabledSystems.coins) {
        scrollCoordinator.unregisterSystem('scroll-coins');
      }
    };
  }, [finalConfig]);

  // Handle page changes for horizontal scroll restoration
  useEffect(() => {
    if (finalConfig.enabledSystems.horizontal) {
      horizontalScrollManager.setCurrentPage(location.pathname);
    }
  }, [location.pathname, finalConfig.enabledSystems.horizontal]);

  // Return utility functions for debugging and control
  return {
    getPerformanceStats: () => scrollCoordinator.getPerformanceStats(),
    resetAllSystems: () => scrollCoordinator.resetAllSystems(),
    disableSystem: (systemId: string) => scrollCoordinator.disableSystem(systemId),
    enableSystem: (systemId: string) => scrollCoordinator.enableSystem(systemId),
    isScrolling: () => scrollCoordinator.isCurrentlyScrolling(),
    getCurrentScrollY: () => scrollCoordinator.getCurrentScrollY()
  };
};