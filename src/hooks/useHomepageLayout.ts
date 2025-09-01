
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Define the structure for a layout item from the DB
export interface HomepageLayoutItem {
  id: number;
  section_key: string; // e.g., 'hero_banner', 'product_section_uuid', 'special_section_uuid'
  display_order: number;
  is_visible: boolean;
  title?: string; // Fetched title for display in admin
}

// Define the structure for updating layout items
interface LayoutUpdatePayload {
  id: number;
  section_key: string; // Required for upsert
  display_order: number;
  is_visible: boolean;
}

export const useHomepageLayout = () => {
  const [layoutItems, setLayoutItems] = useState<HomepageLayoutItem[]>([]);
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
      default: return null; // Not a fixed section
    }
  };

  const fetchLayout = useCallback(async () => {
    console.log('[useHomepageLayout] Fetching layout...'); // Log start
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch layout order
      const { data: layoutData, error: layoutError } = await supabase
        .from('homepage_layout')
        .select('*')
        .order('display_order', { ascending: true });

      if (layoutError) throw layoutError;
      if (!layoutData) throw new Error('No layout data received');
      console.log('[useHomepageLayout] Raw layout data:', layoutData); // Log raw layout data

      // 2. Identify keys for dynamic sections (products and special)
      const productSectionKeys = layoutData
        .map(item => item.section_key)
        .filter(key => key.startsWith('product_section_'));
      const specialSectionKeys = layoutData
        .map(item => item.section_key)
        .filter(key => key.startsWith('special_section_'));
      console.log('[useHomepageLayout] Product Section Keys:', productSectionKeys); // Log keys
      console.log('[useHomepageLayout] Special Section Keys:', specialSectionKeys); // Log keys

      // 3. Fetch titles for dynamic sections concurrently
      let productSectionsData: { id: string, title: string }[] = [];
      let specialSectionsData: { id: string, title: string }[] = [];

      const fetchPromises = [];

      if (productSectionKeys.length > 0) {
        const sectionIds = productSectionKeys.map(key => key.replace('product_section_', ''));
        fetchPromises.push(
          supabase
            .from('product_sections')
            .select('id, title')
            .in('id', sectionIds)
            .then(({ data, error }) => {
              if (error) console.warn('[useHomepageLayout] Could not fetch product section titles:', error.message);
              else {
                productSectionsData = data || [];
                console.log('[useHomepageLayout] Fetched Product Section Titles:', productSectionsData); // Log fetched titles
              }
            })
        );
      }

      if (specialSectionKeys.length > 0) {
        const sectionIds = specialSectionKeys.map(key => key.replace('special_section_', ''));
        fetchPromises.push(
          supabase
            .from('special_sections') // Fetch from special_sections table
            .select('id, title')
            .in('id', sectionIds)
            .then(({ data, error }) => {
              if (error) console.warn('[useHomepageLayout] Could not fetch special section titles:', error.message);
              else {
                specialSectionsData = data || [];
                console.log('[useHomepageLayout] Fetched Special Section Titles:', specialSectionsData); // Log fetched titles
              }
            })
        );
      }

      await Promise.all(fetchPromises);

      // 4. Combine layout data with titles
      const enrichedLayoutData = layoutData.map(item => {
        let title = getFixedSectionTitle(item.section_key);

        if (!title) { // If not a fixed section, check dynamic ones
          if (item.section_key.startsWith('product_section_')) {
            const sectionId = item.section_key.replace('product_section_', '');
            const productSection = productSectionsData.find(sec => sec.id === sectionId);
            title = productSection ? `Seção Produtos: ${productSection.title}` : `Seção Produtos: ${sectionId.substring(0, 8)}...`;
          } else if (item.section_key.startsWith('special_section_')) {
            const sectionId = item.section_key.replace('special_section_', '');
            const specialSection = specialSectionsData.find(sec => sec.id === sectionId);
            title = specialSection ? `Seção Especial: ${specialSection.title}` : `Seção Especial: ${sectionId.substring(0, 8)}...`;
          } else {
            title = item.section_key; // Fallback if key format is unknown
          }
        }
        return { ...item, title }; // Add the determined title
      });

      console.log('[useHomepageLayout] Enriched layout data:', enrichedLayoutData); // Log final data
      setLayoutItems(enrichedLayoutData);

    } catch (err: any) {
      console.error('[useHomepageLayout] Error fetching homepage layout:', err);
      setError('Falha ao carregar o layout da página inicial.');
      toast({ title: 'Erro', description: 'Não foi possível carregar a configuração do layout.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateLayout = useCallback(async (updates: LayoutUpdatePayload[]) => {
    console.log('[useHomepageLayout] Updating layout:', updates); // Log updates
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('homepage_layout')
        .upsert(updates, { onConflict: 'id' });

      if (updateError) throw updateError;

      await fetchLayout();
      toast({ title: 'Sucesso', description: 'Layout da página inicial atualizado.' });

    } catch (err: any) {
      console.error('[useHomepageLayout] Error updating homepage layout:', err);
      setError('Falha ao atualizar o layout da página inicial.');
      toast({ title: 'Erro', description: 'Não foi possível salvar as alterações no layout.', variant: 'destructive' });
      await fetchLayout();
    } finally {
      setLoading(false);
    }
  }, [toast, fetchLayout]);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  return { layoutItems, setLayoutItems, loading, error, fetchLayout, updateLayout };
};

