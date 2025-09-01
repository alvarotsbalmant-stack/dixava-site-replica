import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  isNavigating: boolean;
  currentPage: string | null;
  targetPage: string | null;
  progress: number;
}

interface LoadingContextType {
  loadingState: LoadingState;
  startNavigation: (targetPage: string) => void;
  updateProgress: (progress: number) => void;
  finishNavigation: () => void;
  cancelNavigation: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isNavigating: false,
    currentPage: null,
    targetPage: null,
    progress: 0
  });

  const startNavigation = useCallback((targetPage: string) => {
    setLoadingState(prev => ({
      ...prev,
      isNavigating: true,
      currentPage: window.location.pathname,
      targetPage,
      progress: 0
    }));
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  }, []);

  const finishNavigation = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isNavigating: false,
      currentPage: prev.targetPage,
      targetPage: null,
      progress: 100
    }));
    
    // Reset progress after a short delay
    setTimeout(() => {
      setLoadingState(prev => ({
        ...prev,
        progress: 0
      }));
    }, 300);
  }, []);

  const cancelNavigation = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isNavigating: false,
      targetPage: null,
      progress: 0
    }));
  }, []);

  const value: LoadingContextType = {
    loadingState,
    startNavigation,
    updateProgress,
    finishNavigation,
    cancelNavigation
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

