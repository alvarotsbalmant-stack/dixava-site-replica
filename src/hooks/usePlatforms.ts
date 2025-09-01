import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Platform {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  icon_emoji: string;
  color: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const usePlatforms = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar todas as plataformas
  const fetchPlatforms = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPlatforms(data || []);
    } catch (error) {
      console.error('Erro ao carregar plataformas:', error);
      toast({
        title: "Erro ao carregar plataformas",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar apenas plataformas ativas
  const fetchActivePlatforms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar plataformas ativas:', error);
      return [];
    }
  }, []);

  // Criar nova plataforma
  const createPlatform = useCallback(async (platformData: Omit<Platform, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platforms')
        .insert([platformData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchPlatforms();
      toast({
        title: "Plataforma criada com sucesso!",
        description: `A plataforma ${platformData.name} foi criada.`,
      });
      
      return data;
    } catch (error: any) {
      console.error('Erro ao criar plataforma:', error);
      toast({
        title: "Erro ao criar plataforma",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchPlatforms, toast]);

  // Atualizar plataforma
  const updatePlatform = useCallback(async (id: string, updates: Partial<Platform>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('platforms')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchPlatforms();
      toast({
        title: "Plataforma atualizada com sucesso!",
        description: "As alterações foram salvas.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar plataforma:', error);
      toast({
        title: "Erro ao atualizar plataforma",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPlatforms, toast]);

  // Deletar plataforma
  const deletePlatform = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPlatforms();
      toast({
        title: "Plataforma removida com sucesso!",
        description: "A plataforma foi removida do sistema.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar plataforma:', error);
      toast({
        title: "Erro ao remover plataforma",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPlatforms, toast]);

  // Carregar plataformas na inicialização
  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  return {
    platforms,
    loading,
    fetchPlatforms,
    fetchActivePlatforms,
    createPlatform,
    updatePlatform,
    deletePlatform
  };
};

export default usePlatforms;