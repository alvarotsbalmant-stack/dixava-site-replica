
import { Page } from './types';
import { supabase } from '@/integrations/supabase/client';

// Utility functions for page operations
export const createPageOperations = (
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Buscar uma página pelo slug
  const getPageBySlug = (pages: Page[], slug: string) => {
    return pages.find(page => page.slug === slug) || null;
  };

  // Buscar uma página pelo ID
  const getPageById = (pages: Page[], id: string) => {
    return pages.find(page => page.id === id) || null;
  };

  // Helper function to safely convert theme data
  const convertThemeData = (themeData: any): Page['theme'] => {
    if (!themeData || typeof themeData !== 'object') {
      return {
        primaryColor: '#107C10',
        secondaryColor: '#3A3A3A'
      };
    }

    // Handle case where theme is an array (shouldn't happen but just in case)
    if (Array.isArray(themeData)) {
      return {
        primaryColor: '#107C10',
        secondaryColor: '#3A3A3A'
      };
    }

    // Return the theme data as is if it's a proper object
    return themeData as Page['theme'];
  };

  // Carregar todas as páginas do Supabase
  const fetchPages = async () => {
    try {
      console.log("Fetching pages from Supabase...");
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Raw pages data from Supabase:", data);

      // Mapear dados do Supabase para o formato esperado
      const mappedPages: Page[] = (data || []).map(pageData => ({
        id: pageData.id,
        title: pageData.title,
        slug: pageData.slug,
        description: pageData.description || '',
        isActive: pageData.is_active,
        theme: convertThemeData(pageData.theme),
        filters: {
          tagIds: [],
          categoryIds: [],
          excludeTagIds: [],
          excludeCategoryIds: []
        },
        createdAt: pageData.created_at,
        updatedAt: pageData.updated_at
      }));

      console.log("Mapped pages:", mappedPages);
      setPages(mappedPages);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching pages:", err);
      setError('Erro ao carregar páginas');
    }
  };

  // Criar uma nova página no Supabase
  const createPage = async (pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log("Creating page:", pageData);
      
      const { data, error } = await supabase
        .from('pages')
        .insert({
          title: pageData.title,
          slug: pageData.slug,
          description: pageData.description,
          is_active: pageData.isActive,
          theme: pageData.theme as any
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating page:", error);
        throw error;
      }

      console.log("Created page:", data);

      const newPage: Page = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        isActive: data.is_active,
        theme: convertThemeData(data.theme),
        filters: pageData.filters,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setPages(prev => [...prev, newPage]);
      return newPage;
    } catch (err: any) {
      console.error("Error creating page:", err);
      setError('Erro ao criar página');
      throw err;
    }
  };

  // Atualizar uma página existente no Supabase
  const updatePage = async (id: string, pageData: Partial<Omit<Page, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      console.log("Updating page:", id, pageData);
      
      const { data, error } = await supabase
        .from('pages')
        .update({
          title: pageData.title,
          slug: pageData.slug,
          description: pageData.description,
          is_active: pageData.isActive,
          theme: pageData.theme as any
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating page:", error);
        throw error;
      }

      console.log("Updated page:", data);

      const updatedPage: Page = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description || '',
        isActive: data.is_active,
        theme: convertThemeData(data.theme),
        filters: pageData.filters || {
          tagIds: [],
          categoryIds: [],
          excludeTagIds: [],
          excludeCategoryIds: []
        },
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
      
      setPages(prev => prev.map(page => page.id === id ? updatedPage : page));
      return updatedPage;
    } catch (err: any) {
      console.error("Error updating page:", err);
      setError(`Erro ao atualizar página ${id}`);
      throw err;
    }
  };

  // Excluir uma página do Supabase
  const deletePage = async (id: string) => {
    try {
      console.log("Deleting page:", id);
      
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting page:", error);
        throw error;
      }

      console.log("Deleted page:", id);
      setPages(prev => prev.filter(page => page.id !== id));
      return true;
    } catch (err: any) {
      console.error("Error deleting page:", err);
      setError(`Erro ao excluir página ${id}`);
      throw err;
    }
  };

  return {
    getPageBySlug,
    getPageById,
    fetchPages,
    createPage,
    updatePage,
    deletePage
  };
};
