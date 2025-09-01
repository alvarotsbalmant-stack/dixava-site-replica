import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

// Types para o sistema de Páginas Prime
export interface PrimePage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrimePageLayoutItem {
  id: string;
  page_id: string;
  section_key: string;
  section_type: string;
  section_config: Record<string, any>;
  display_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrimePageWithLayout extends PrimePage {
  layout_items?: PrimePageLayoutItem[];
}

// Input types para criação/edição
export interface PrimePageInput {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  is_active?: boolean;
}

export interface PrimePageLayoutInput {
  section_key: string;
  section_type: string;
  section_config: Record<string, any>;
  display_order: number;
  is_visible?: boolean;
}

export const usePrimePages = () => {
  const [pages, setPages] = useState<PrimePage[]>([]);
  const [pageLayouts, setPageLayouts] = useState<Record<string, PrimePageLayoutItem[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar todas as páginas Prime
  const fetchPages = useCallback(async () => {
    console.log('[usePrimePages] Fetching pages...');
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('prime_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('[usePrimePages] Fetched pages:', data);
      setPages(data || []);
    } catch (err: any) {
      console.error('[usePrimePages] Error fetching pages:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao carregar as páginas Prime.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar uma página específica com seu layout
  const fetchPageWithLayout = useCallback(async (pageId: string): Promise<PrimePageWithLayout | null> => {
    try {
      // Buscar página
      const { data: pageData, error: pageError } = await supabase
        .from('prime_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (pageError) throw pageError;

      // Buscar layout items
      const { data: layoutData, error: layoutError } = await supabase
        .from('prime_page_layout')
        .select('*')
        .eq('page_id', pageId)
        .order('display_order', { ascending: true });

      if (layoutError) throw layoutError;

      return {
        ...pageData,
        layout_items: (layoutData || []).map(item => ({
          ...item,
          section_config: item.section_config as Record<string, any>
        }))
      };
    } catch (err: any) {
      console.error('[usePrimePages] Error fetching page with layout:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao carregar a página.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      return null;
    }
  }, [toast]);

  // Get page by slug (synchronous method for existing pages)
  const getPageBySlug = useCallback((slug: string): PrimePage | null => {
    return pages.find(page => page.slug === slug && page.is_active) || null;
  }, [pages]);

  // Fetch page layout by page ID
  const fetchPageLayout = useCallback(async (pageId: string): Promise<PrimePageLayoutItem[]> => {
    try {
      const { data: layoutData, error: layoutError } = await supabase
        .from('prime_page_layout')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (layoutError) throw layoutError;

      const layoutItems = (layoutData || []).map(item => ({
        ...item,
        section_config: item.section_config as Record<string, any>
      }));
      
      // Update pageLayouts cache
      setPageLayouts(prev => ({
        ...prev,
        [pageId]: layoutItems
      }));

      return layoutItems;
    } catch (err: any) {
      console.error('[usePrimePages] Error fetching page layout:', err);
      return [];
    }
  }, []);
  const fetchPageBySlug = useCallback(async (slug: string): Promise<PrimePageWithLayout | null> => {
    try {
      // Buscar página
      const { data: pageData, error: pageError } = await supabase
        .from('prime_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (pageError) throw pageError;

      // Buscar layout items
      const { data: layoutData, error: layoutError } = await supabase
        .from('prime_page_layout')
        .select('*')
        .eq('page_id', pageData.id)
        .eq('is_visible', true)
        .order('display_order', { ascending: true });

      if (layoutError) throw layoutError;

      return {
        ...pageData,
        layout_items: (layoutData || []).map(item => ({
          ...item,
          section_config: item.section_config as Record<string, any>
        }))
      };
    } catch (err: any) {
      console.error('[usePrimePages] Error fetching page by slug:', err);
      return null;
    }
  }, []);

  // Criar nova página
  const createPage = useCallback(async (pageInput: PrimePageInput): Promise<PrimePage | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prime_pages')
        .insert({
          title: pageInput.title,
          slug: pageInput.slug,
          description: pageInput.description,
          meta_title: pageInput.meta_title,
          meta_description: pageInput.meta_description,
          is_active: pageInput.is_active ?? true
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Página Prime criada com sucesso.' });
      await fetchPages();
      return data;
    } catch (err: any) {
      console.error('[usePrimePages] Error creating page:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao criar a página.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPages]);

  // Atualizar página
  const updatePage = useCallback(async (pageInput: PrimePageInput): Promise<boolean> => {
    if (!pageInput.id) return false;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('prime_pages')
        .update({
          title: pageInput.title,
          slug: pageInput.slug,
          description: pageInput.description,
          meta_title: pageInput.meta_title,
          meta_description: pageInput.meta_description,
          is_active: pageInput.is_active ?? true
        })
        .eq('id', pageInput.id);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Página atualizada com sucesso.' });
      await fetchPages();
      return true;
    } catch (err: any) {
      console.error('[usePrimePages] Error updating page:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao atualizar a página.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPages]);

  // Deletar página
  const deletePage = useCallback(async (pageId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('prime_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Página removida com sucesso.' });
      await fetchPages();
      return true;
    } catch (err: any) {
      console.error('[usePrimePages] Error deleting page:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao remover a página.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchPages]);

  // Adicionar item ao layout
  const addLayoutItem = useCallback(async (pageId: string, layoutInput: PrimePageLayoutInput): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('prime_page_layout')
        .insert({
          page_id: pageId,
          section_key: layoutInput.section_key,
          section_type: layoutInput.section_type,
          section_config: layoutInput.section_config,
          display_order: layoutInput.display_order,
          is_visible: layoutInput.is_visible ?? true
        });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Seção adicionada com sucesso.' });
      return true;
    } catch (err: any) {
      console.error('[usePrimePages] Error adding layout item:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao adicionar a seção.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      return false;
    }
  }, [toast]);

  // Atualizar item do layout
  const updateLayoutItem = useCallback(async (itemId: string, layoutInput: Partial<PrimePageLayoutInput>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('prime_page_layout')
        .update(layoutInput)
        .eq('id', itemId);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Seção atualizada com sucesso.' });
      return true;
    } catch (err: any) {
      console.error('[usePrimePages] Error updating layout item:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao atualizar a seção.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      return false;
    }
  }, [toast]);

  // Remover item do layout
  const removeLayoutItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('prime_page_layout')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Seção removida com sucesso.' });
      return true;
    } catch (err: any) {
      console.error('[usePrimePages] Error removing layout item:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao remover a seção.';
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      return false;
    }
  }, [toast]);

  // Fetch inicial
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    pageLayouts,
    loading,
    error,
    fetchPages,
    fetchPageWithLayout,
    fetchPageBySlug,
    getPageBySlug,
    fetchPageLayout,
    createPage,
    updatePage,
    deletePage,
    addLayoutItem,
    updateLayoutItem,
    removeLayoutItem
  };
};

