import { create } from 'zustand';
import { SKUNavigation } from '@/hooks/useProducts/types';

interface SKUNavigationState {
  skuNavigations: Map<string, SKUNavigation>;
  currentProductId: string | null;
  isOptimisticUpdate: boolean;
}

interface SKUNavigationActions {
  setSKUNavigation: (productId: string, navigation: SKUNavigation) => void;
  getSKUNavigation: (productId: string) => SKUNavigation | null;
  setCurrentProduct: (productId: string) => void;
  setOptimisticUpdate: (isOptimistic: boolean) => void;
  clearCache: () => void;
  prefetchSKUNavigation: (productId: string, navigation: SKUNavigation) => void;
}

export const useSKUNavigationStore = create<SKUNavigationState & SKUNavigationActions>((set, get) => ({
  skuNavigations: new Map(),
  currentProductId: null,
  isOptimisticUpdate: false,

  setSKUNavigation: (productId, navigation) => {
    set((state) => {
      const newNavigations = new Map(state.skuNavigations);
      newNavigations.set(productId, navigation);
      return { skuNavigations: newNavigations };
    });
  },

  getSKUNavigation: (productId) => {
    const state = get();
    return state.skuNavigations.get(productId) || null;
  },

  setCurrentProduct: (productId) => {
    set({ currentProductId: productId });
  },

  setOptimisticUpdate: (isOptimistic) => {
    set({ isOptimisticUpdate: isOptimistic });
  },

  clearCache: () => {
    set({ skuNavigations: new Map() });
  },

  prefetchSKUNavigation: (productId, navigation) => {
    const state = get();
    if (!state.skuNavigations.has(productId)) {
      get().setSKUNavigation(productId, navigation);
    }
  }
}));