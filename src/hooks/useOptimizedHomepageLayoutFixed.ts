import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define the structure for a layout item from the optimized view
export interface OptimizedHomepageLayoutItem {
  id: number;
  section_key: string;
  display_order: number;
  is_visible: boolean;
  title?: string;
  // Campos adicionais da view unificada
  product_section_data?: any;
  special_section_data?: any;
}

// Define the structure for updating layout items
interface LayoutUpdatePayload {
  id: number;
  section_key: string;
  display_order: number;
  is_visible: boolean;
}

export const useOptimizedHomepageLayoutFixed = () => {
  const [layoutItems, setLayoutItems] = useState<OptimizedHomepageLayoutItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Hardcoded titles for fixed sections
  const getFixedSectionTitle = (key: string): string | null => {
    switch (key) {
      case 'hero_banner': return 'Carrossel de Banners Principal';
      case 'hero_quick_links': return 'Links Rápidos (Categorias)';
      case 'promo_banner': return 'Banner Promocional (UTI PRO)';
      case 'specialized_services': return 'Seção: Nossos Serviços Especializados';
      case 'why_choose_us': return 'Seção: Por que escolher a UTI DOS GAMES?';
      case 'contact_help': return 'Seção: Precisa de Ajuda/Contato';
      default: return null;
    }
  };

  const fetchLayout = useCallback(async () => {
    console.log('[useOptimizedHomepageLayoutFixed] Fetching optimized layout...');
    setLoading(true);
    setError(null);
    
    try {
      // Tentar usar a view otimizada primeiro
      const { data: optimizedData, error: optimizedError } = await supabase
        .from('view_homepage_layout_complete')
        .select('*')
        .order('display_order', { ascending: true });

      if (optimizedError) {
        console.warn('[useOptimizedHomepageLayoutFixed] Optimized view failed, falling back to traditional method:', optimizedError.message);
        
        // Fallback para método tradicional se a view não existir
        const { data: layoutData, error: layoutError } = await supabase
          .from('homepage_layout')
          .select('*')
          .order('display_order', { ascending: true });

        if (layoutError) throw layoutError;
        if (!layoutData) throw new Error('No layout data received');

        // Processar dados tradicionais
        const enrichedLayoutData = layoutData.map(item => {
          let title = getFixedSectionTitle(item.section_key);
          
          if (!title) {
            if (item.section_key.startsWith('product_section_')) {
              const sectionId = item.section_key.replace('product_section_', '');
              title = `Seção Produtos: ${sectionId.substring(0, 8)}...`;
            } else if (item.section_key.startsWith('special_section_')) {
              const sectionId = item.section_key.replace('special_section_', '');
              title = `Seção Especial: ${sectionId.substring(0, 8)}...`;
            } else {
              title = item.section_key;
            }
          }
          
          return { ...item, title };
        });

        console.log('[useOptimizedHomepageLayoutFixed] Using fallback data:', enrichedLayoutData);
        setLayoutItems(enrichedLayoutData);
        return;
      }

      if (!optimizedData) throw new Error('No optimized data received');

      console.log('[useOptimizedHomepageLayoutFixed] Using optimized view data:', optimizedData);

      // Processar dados da view otimizada
      const enrichedLayoutData = optimizedData.map(item => {
        let title = getFixedSectionTitle(item.section_key);

        if (!title) {
          if (item.section_key.startsWith('product_section_')) {
            // Usar dados diretamente dos campos específicos
            if (item.product_section_title) {
              title = `Seção Produtos: ${item.product_section_title}`;
            } else {
              const sectionId = item.section_key.replace('product_section_', '');
              title = `Seção Produtos: ${sectionId.substring(0, 8)}...`;
            }
          } else if (item.section_key.startsWith('special_section_')) {
            // Usar dados diretamente dos campos específicos
            if (item.special_section_title) {
              title = `Seção Especial: ${item.special_section_title}`;
            } else {
              const sectionId = item.section_key.replace('special_section_', '');
              title = `Seção Especial: ${sectionId.substring(0, 8)}...`;
            }
          } else {
            title = item.section_key;
          }
        }

        return { ...item, title };
      });

      console.log('[useOptimizedHomepageLayoutFixed] Final enriched data:', enrichedLayoutData);
      setLayoutItems(enrichedLayoutData);

    } catch (err: any) {
      console.error('[useOptimizedHomepageLayoutFixed] Error fetching homepage layout:', err);
      setError('Falha ao carregar o layout da página inicial.');
      
      // Toast apenas em desenvolvimento para não incomodar usuários
      if (process.env.NODE_ENV === 'development') {
        toast({ 
          title: 'Erro', 
          description: 'Não foi possível carregar a configuração do layout.', 
          variant: 'destructive' 
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateLayout = useCallback(async (updates: LayoutUpdatePayload[]) => {
    console.log('[useOptimizedHomepageLayoutFixed] Updating layout:', updates);
    setLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('homepage_layout')
        .upsert(updates, { onConflict: 'id' });

      if (updateError) throw updateError;

      await fetchLayout();
      
      if (process.env.NODE_ENV === 'development') {
        toast({ title: 'Sucesso', description: 'Layout da página inicial atualizado.' });
      }

    } catch (err: any) {
      console.error('[useOptimizedHomepageLayoutFixed] Error updating homepage layout:', err);
      setError('Falha ao atualizar o layout da página inicial.');
      
      if (process.env.NODE_ENV === 'development') {
        toast({ 
          title: 'Erro', 
          description: 'Não foi possível salvar as alterações no layout.', 
          variant: 'destructive' 
        });
      }
      
      await fetchLayout();
    } finally {
      setLoading(false);
    }
  }, [toast, fetchLayout]);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  return { 
    layoutItems, 
    setLayoutItems, 
    loading, 
    error, 
    fetchLayout, 
    updateLayout 
  };
};

