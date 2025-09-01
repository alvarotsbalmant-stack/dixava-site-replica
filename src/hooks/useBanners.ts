// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  button_text?: string;
  button_link?: string;
  image_url?: string; // Existing field, can be deprecated or used as fallback
  image_url_desktop?: string; // New field for desktop image
  image_url_mobile?: string; // New field for mobile image
  button_image_url?: string;
  gradient: string;
  background_type?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  button_link_desktop?: string; // New field for desktop button link
  button_link_mobile?: string; // New field for mobile button link
  device_type?: 'desktop' | 'mobile'; // New field for device type
}

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      setBanners(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar banners:', error);
      toast({
        title: "Erro ao carregar banners",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBanner = async (bannerData: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .insert([bannerData])
        .select()
        .single();

      if (error) throw error;

      setBanners(prev => [...prev, data]);
      toast({
        title: "Banner adicionado com sucesso!",
        description: "O banner foi criado e está ativo.",
      });
    } catch (error: any) {
      console.error('Erro ao adicionar banner:', error);
      toast({
        title: "Erro ao adicionar banner",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBanner = async (id: string, bannerData: Partial<Banner>) => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .update({ ...bannerData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBanners(prev => prev.map(banner => banner.id === id ? data : banner));
      toast({
        title: "Banner atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar banner:', error);
      toast({
        title: "Erro ao atualizar banner",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBanners(prev => prev.filter(banner => banner.id !== id));
      toast({
        title: "Banner excluído com sucesso!",
        description: "O banner foi removido.",
      });
    } catch (error: any) {
      console.error('Erro ao excluir banner:', error);
      toast({
        title: "Erro ao excluir banner",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    loading,
    addBanner,
    updateBanner,
    deleteBanner,
    refetch: fetchBanners
  };
};


