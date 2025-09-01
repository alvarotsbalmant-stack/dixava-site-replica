
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  position: number;
  is_active: boolean;
  background_image_url?: string;
  shadow_color?: string;
  shadow_enabled?: boolean;
  icon_filter_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export const useServiceCards = () => {
  const [serviceCards, setServiceCards] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServiceCards = async () => {
    try {
      const { data, error } = await supabase
        .from('service_cards')
        .select('*')
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      setServiceCards(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar cards de serviços:', error);
      toast({
        title: "Erro ao carregar cards de serviços",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addServiceCard = async (cardData: Omit<ServiceCard, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('service_cards')
        .insert([cardData])
        .select()
        .single();

      if (error) throw error;

      setServiceCards(prev => [...prev, data]);
      toast({
        title: "Card de serviço adicionado com sucesso!",
        description: "O card foi criado e está ativo.",
      });
    } catch (error: any) {
      console.error('Erro ao adicionar card de serviço:', error);
      toast({
        title: "Erro ao adicionar card de serviço",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateServiceCard = async (id: string, cardData: Partial<ServiceCard>) => {
    try {
      const { data, error } = await supabase
        .from('service_cards')
        .update({ ...cardData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setServiceCards(prev => prev.map(card => card.id === id ? data : card));
      toast({
        title: "Card de serviço atualizado com sucesso!",
        description: "As alterações foram salvas.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar card de serviço:', error);
      toast({
        title: "Erro ao atualizar card de serviço",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteServiceCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServiceCards(prev => prev.filter(card => card.id !== id));
      toast({
        title: "Card de serviço excluído com sucesso!",
        description: "O card foi removido permanentemente.",
      });
    } catch (error: any) {
      console.error('Erro ao excluir card de serviço:', error);
      toast({
        title: "Erro ao excluir card de serviço",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchServiceCards();
  }, []);

  return {
    serviceCards,
    loading,
    addServiceCard,
    updateServiceCard,
    deleteServiceCard,
    refetch: fetchServiceCards
  };
};
