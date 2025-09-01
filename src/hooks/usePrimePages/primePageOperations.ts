
import { PrimePage } from './types';
import { supabase } from '@/integrations/supabase/client';

export const createPrimePageOperations = (
  setPages: React.Dispatch<React.SetStateAction<PrimePage[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const fetchPages = async () => {
    try {
      console.log("Fetching prime pages from Supabase...");
      const { data, error } = await supabase
        .from('prime_pages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Raw prime pages data:", data);
      
      const mappedPages: PrimePage[] = (data || []).map(pageData => ({
        id: pageData.id,
        title: pageData.title,
        slug: pageData.slug,
        description: pageData.description,
        meta_title: pageData.meta_title,
        meta_description: pageData.meta_description,
        is_active: pageData.is_active,
        created_at: pageData.created_at,
        updated_at: pageData.updated_at
      }));

      console.log("Mapped prime pages:", mappedPages);
      setPages(mappedPages);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching prime pages:", err);
      setError('Erro ao carregar páginas Prime');
    }
  };

  const getPageBySlug = (pages: PrimePage[], slug: string) => {
    return pages.find(page => page.slug === slug) || null;
  };

  const getPageById = (pages: PrimePage[], id: string) => {
    return pages.find(page => page.id === id) || null;
  };

  const createPage = async (pageData: Omit<PrimePage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("Creating prime page:", pageData);
      
      const { data, error } = await supabase
        .from('prime_pages')
        .insert({
          title: pageData.title,
          slug: pageData.slug,
          description: pageData.description,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          is_active: pageData.is_active
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating prime page:", error);
        throw error;
      }

      console.log("Created prime page:", data);

      const newPage: PrimePage = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setPages(prev => [...prev, newPage]);
      return newPage;
    } catch (err: any) {
      console.error("Error creating prime page:", err);
      setError('Erro ao criar página Prime');
      throw err;
    }
  };

  const updatePage = async (id: string, pageData: Partial<Omit<PrimePage, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      console.log("Updating prime page:", id, pageData);
      
      const { data, error } = await supabase
        .from('prime_pages')
        .update({
          title: pageData.title,
          slug: pageData.slug,
          description: pageData.description,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          is_active: pageData.is_active
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating prime page:", error);
        throw error;
      }

      console.log("Updated prime page:", data);

      const updatedPage: PrimePage = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setPages(prev => prev.map(page => page.id === id ? updatedPage : page));
      return updatedPage;
    } catch (err: any) {
      console.error("Error updating prime page:", err);
      setError(`Erro ao atualizar página Prime ${id}`);
      throw err;
    }
  };

  const deletePage = async (id: string) => {
    try {
      console.log("Deleting prime page:", id);
      
      const { error } = await supabase
        .from('prime_pages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting prime page:", error);
        throw error;
      }

      console.log("Deleted prime page:", id);
      setPages(prev => prev.filter(page => page.id !== id));
      return true;
    } catch (err: any) {
      console.error("Error deleting prime page:", err);
      setError(`Erro ao excluir página Prime ${id}`);
      throw err;
    }
  };

  return {
    fetchPages,
    getPageBySlug,
    getPageById,
    createPage,
    updatePage,
    deletePage
  };
};
