import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type SpecialSection = Database['public']['Tables']['special_sections']['Row'];

// Função para buscar seções especiais
const fetchSpecialSections = async (): Promise<SpecialSection[]> => {
  console.log('[useSpecialSectionsOptimized] Fetching special sections...');
  
  const { data, error } = await supabase
    .from('special_sections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const sectionsData = (data || []) as SpecialSection[];
  console.log(`[useSpecialSectionsOptimized] Loaded ${sectionsData.length} sections:`, sectionsData);
  
  return sectionsData;
};

// Hook otimizado com React Query
export const useSpecialSectionsOptimized = () => {
  return useQuery({
    queryKey: ['special-sections-optimized'],
    queryFn: fetchSpecialSections,
    staleTime: 10 * 60 * 1000, // 10 minutos - cache moderado
    gcTime: 20 * 60 * 1000, // 20 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

