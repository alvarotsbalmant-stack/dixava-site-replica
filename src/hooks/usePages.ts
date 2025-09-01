
import { useState, useEffect, useCallback } from 'react';
import { Page, PageLayoutItem } from './usePages/types';
import { createPageOperations } from './usePages/pageOperations';
import { createLayoutOperations } from './usePages/layoutOperations';

// Export types for backward compatibility
export type { Page, PageLayoutItem, PageTheme, PageFilter } from './usePages/types';

// Hook to manage dynamic pages
export const usePages = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [pageLayouts, setPageLayouts] = useState<Record<string, PageLayoutItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create operation utilities
  const pageOps = createPageOperations(setPages, setError);
  const layoutOps = createLayoutOperations(pageLayouts, setPageLayouts, setError);

  // Optimized function to fetch pages
  const fetchPages = useCallback(async () => {
    if (isInitialized) return; // Avoid unnecessary reloads
    
    setLoading(true);
    try {
      await pageOps.fetchPages();
      setIsInitialized(true);
    } catch (err) {
      console.error('Erro ao carregar páginas:', err);
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  // Optimized function to fetch layout
  const fetchPageLayout = useCallback(async (pageId: string) => {
    // Avoid reloading existing layout
    if (pageLayouts[pageId]) {
      return pageLayouts[pageId];
    }

    try {
      return await layoutOps.fetchPageLayout(pageId);
    } catch (err) {
      console.error('Erro ao carregar layout:', err);
      return [];
    }
  }, [pageLayouts]);

  // Memoized functions that depend on current pages state
  const getPageBySlug = useCallback((slug: string) => {
    return pageOps.getPageBySlug(pages, slug);
  }, [pages]);

  const getPageById = useCallback((id: string) => {
    return pageOps.getPageById(pages, id);
  }, [pages]);

  // Wrapper functions for operations that don't need loading state management
  const createPage = useCallback(async (pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => {
    return pageOps.createPage(pageData);
  }, []);

  const updatePage = useCallback(async (id: string, pageData: Partial<Omit<Page, 'id' | 'createdAt' | 'updatedAt'>>) => {
    return pageOps.updatePage(id, pageData);
  }, []);

  const deletePage = useCallback(async (id: string) => {
    return pageOps.deletePage(id);
  }, []);

  const updatePageLayout = useCallback(async (pageId: string, layoutItems: Partial<PageLayoutItem>[]) => {
    return layoutOps.updatePageLayout(pageId, layoutItems);
  }, [pageLayouts]);

  const addPageSection = useCallback(async (pageId: string, section: Omit<PageLayoutItem, 'id'>) => {
    return layoutOps.addPageSection(pageId, section);
  }, [pageLayouts]);

  const removePageSection = useCallback(async (pageId: string, sectionId: string) => {
    return layoutOps.removePageSection(pageId, sectionId);
  }, [pageLayouts]);

  // Load pages on initialization (only once)
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    pageLayouts,
    loading,
    error,
    fetchPages,
    fetchPageLayout,
    getPageBySlug,
    getPageById,
    createPage,
    updatePage,
    deletePage,
    updatePageLayout,
    addPageSection,
    removePageSection
  };
};
