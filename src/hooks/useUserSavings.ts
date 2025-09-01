import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserSavings {
  total_savings: number;
  promotion_savings: number;
  uti_pro_savings: number;
  total_purchases: number;
}

export const useUserSavings = () => {
  const { user } = useAuth();

  const {
    data: savings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['user-savings', user?.id],
    queryFn: async (): Promise<UserSavings> => {
      if (!user?.id) {
        return {
          total_savings: 0,
          promotion_savings: 0,
          uti_pro_savings: 0,
          total_purchases: 0
        };
      }

      const { data, error } = await supabase
        .rpc('get_user_total_savings', {
          p_user_id: user.id
        });

      if (error) {
        console.error('Erro ao buscar economia do usuário:', error);
        throw error;
      }

      // A função retorna um array, pegamos o primeiro item
      const result = data?.[0] || {
        total_savings: 0,
        promotion_savings: 0,
        uti_pro_savings: 0,
        total_purchases: 0
      };

      return {
        total_savings: Number(result.total_savings) || 0,
        promotion_savings: Number(result.promotion_savings) || 0,
        uti_pro_savings: Number(result.uti_pro_savings) || 0,
        total_purchases: Number(result.total_purchases) || 0
      };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false
  });

  // Função para formatar valores monetários
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return {
    savings: savings || {
      total_savings: 0,
      promotion_savings: 0,
      uti_pro_savings: 0,
      total_purchases: 0
    },
    isLoading,
    error,
    refetch,
    // Valores formatados
    formattedTotalSavings: formatCurrency(savings?.total_savings || 0),
    formattedPromotionSavings: formatCurrency(savings?.promotion_savings || 0),
    formattedUtiProSavings: formatCurrency(savings?.uti_pro_savings || 0),
    // Estatísticas úteis
    hasAnySavings: (savings?.total_savings || 0) > 0,
    hasPurchases: (savings?.total_purchases || 0) > 0
  };
};

