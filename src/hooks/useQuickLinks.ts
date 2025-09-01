import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuickLink {
  id: string;
  label: string;
  path: string;
  icon_url: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useQuickLinks = () => {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuickLinks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quick_links')
        .select('*')
        .eq('is_active', true) // Fetch only active links for frontend display
        .order('position');

      if (error) throw error;
      setQuickLinks(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar links rápidos:', error);
      // Toast might not be appropriate for frontend display errors, maybe handle silently
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all links (including inactive) for admin panel
  const fetchAllQuickLinksForAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quick_links')
        .select('*')
        .order('position');

      if (error) throw error;
      setQuickLinks(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar todos os links rápidos para admin:', error);
      toast({
        title: "Erro ao carregar links rápidos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addQuickLink = async (linkData: Omit<QuickLink, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('quick_links')
        .insert([linkData])
        .select()
        .single();

      if (error) throw error;

      setQuickLinks(prev => [...prev, data].sort((a, b) => a.position - b.position));
      toast({
        title: "Link rápido adicionado com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao adicionar link rápido:', error);
      toast({
        title: "Erro ao adicionar link rápido",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateQuickLink = async (id: string, linkData: Partial<Omit<QuickLink, 'id' | 'created_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('quick_links')
        .update({ ...linkData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setQuickLinks(prev => prev.map(link => link.id === id ? data : link).sort((a, b) => a.position - b.position));
      toast({
        title: "Link rápido atualizado com sucesso!",
      });
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar link rápido:', error);
      toast({
        title: "Erro ao atualizar link rápido",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteQuickLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quick_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuickLinks(prev => prev.filter(link => link.id !== id));
      toast({
        title: "Link rápido excluído com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao excluir link rápido:', error);
      toast({
        title: "Erro ao excluir link rápido",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Initial fetch for frontend usage (can be called specifically in admin too)
  // useEffect(() => {
  //   fetchQuickLinks();
  // }, [fetchQuickLinks]);

  return {
    quickLinks,
    loading,
    fetchQuickLinks, // For frontend
    fetchAllQuickLinksForAdmin, // For admin panel
    addQuickLink,
    updateQuickLink,
    deleteQuickLink,
  };
};

