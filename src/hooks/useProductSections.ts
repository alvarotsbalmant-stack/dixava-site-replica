import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';
import { retrySupabaseQuery } from '@/utils/retryWithAuth';

// Types matching DB structure
export type SectionItemType = 'product' | 'tag';

export interface ProductSectionItem {
  id?: number; // Optional for creation
  section_id: string; // UUID
  item_type: SectionItemType;
  item_id: string; // Product UUID or Tag Name/ID (using name for simplicity now)
  display_order?: number;
}

export interface ProductSection {
  id: string; // UUID
  title: string;
  title_part1?: string;
  title_part2?: string;
  title_color1?: string;
  title_color2?: string;
  view_all_link?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: ProductSectionItem[]; // Populated after fetch
}

// Type for creating/updating a section with its items
export interface ProductSectionInput {
  id?: string; // Required for update, absent for create
  title: string;
  title_part1?: string;
  title_part2?: string;
  title_color1?: string;
  title_color2?: string;
  view_all_link?: string | null;
  items: { type: SectionItemType; id: string }[]; // Simplified item structure for input
}

export interface HomepageLayoutItem {
  id: number;
  section_key: string;
  display_order: number;
  is_visible: boolean;
  title?: string;
}

export const useProductSections = () => {
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSections = useCallback(async () => {
    console.log('[useProductSections] Fetching sections...'); // Log start
    setLoading(true);
    setError(null);
    try {
      // Fetch sections with retry mechanism
      const { data: sectionsData, error: sectionsError } = await retrySupabaseQuery(
        async () => await supabase
          .from('product_sections')
          .select('*')
          .order('created_at', { ascending: false }),
        'fetchProductSections'
      );

      if (sectionsError) throw sectionsError;
      console.log('[useProductSections] Raw sections data:', sectionsData); // Log raw sections

      // Fetch items for each section
      const sectionIds = sectionsData.map(s => s.id);
      let allItems: ProductSectionItem[] = [];
      if (sectionIds.length > 0) {
        console.log('[useProductSections] Fetching items for section IDs:', sectionIds);
        const { data: itemsData, error: itemsError } = await retrySupabaseQuery(
          async () => await supabase
            .from('product_section_items')
            .select('*')
            .in('section_id', sectionIds)
            .order('display_order', { ascending: true }),
          'fetchProductSectionItems'
        );
        if (itemsError) throw itemsError;
        allItems = itemsData || [];
        console.log('[useProductSections] Fetched items data:', allItems); // Log fetched items
      }

      // Combine sections with their items
      const combinedSections = sectionsData.map(section => ({
        ...section,
        items: allItems.filter(item => item.section_id === section.id),
      }));

      console.log('[useProductSections] Combined sections with items:', combinedSections); // Log final data
      setSections(combinedSections);

    } catch (err: any) {
      console.error('[useProductSections] Error fetching product sections:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao carregar as seções de produtos.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createSection = useCallback(async (sectionInput: ProductSectionInput): Promise<ProductSection | null> => {
    setLoading(true);
    setError(null);
    let newSectionId: string | null = null;
    try {
      // 1. Create the section entry
      const { data: newSectionData, error: sectionError } = await supabase
        .from('product_sections')
        .insert({
          title: sectionInput.title,
          title_part1: sectionInput.title_part1,
          title_part2: sectionInput.title_part2,
          title_color1: sectionInput.title_color1,
          title_color2: sectionInput.title_color2,
          view_all_link: sectionInput.view_all_link,
        })
        .select()
        .single();

      if (sectionError) throw sectionError;
      if (!newSectionData) throw new Error('Failed to create section, no data returned.');
      
      newSectionId = newSectionData.id;

      // 2. Create the section items
      if (sectionInput.items && sectionInput.items.length > 0) {
        const itemsToInsert = sectionInput.items.map((item, index) => ({
          section_id: newSectionId,
          item_type: item.type,
          item_id: item.id,
          display_order: index, // Simple order based on input array
        }));
        const { error: itemsError } = await supabase
          .from('product_section_items')
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      // 3. Add to homepage_layout (find the last order and add 1)
      const { data: lastOrderItem, error: orderError } = await supabase
        .from('homepage_layout')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (orderError && orderError.code !== 'PGRST116') { // Ignore 'No rows found' error
         throw orderError;
      }

      const nextOrder = lastOrderItem ? lastOrderItem.display_order + 1 : 1;
      const sectionKey = `product_section_${newSectionId}`;

      const { error: layoutError } = await supabase
        .from('homepage_layout')
        .insert({
          section_key: sectionKey,
          display_order: nextOrder,
          is_visible: true, // Default to visible
        });

      if (layoutError) {
        // Attempt to rollback or notify user about layout inconsistency
        console.error('Failed to add section to layout:', layoutError);
        toast({ title: 'Aviso', description: 'Seção criada, mas falha ao adicionar ao layout da home.', variant: 'destructive' });
        // Don't throw here, section is created, but needs manual layout adjustment
      } else {
         toast({ title: 'Sucesso', description: 'Seção de produtos criada e adicionada ao layout.' });
      }

      // Refetch sections to update the list
      await fetchSections();
      
      // Return the created section with properly mapped items
      const mappedItems: ProductSectionItem[] = sectionInput.items.map((item, index) => ({
        section_id: newSectionId!,
        item_type: item.type,
        item_id: item.id,
        display_order: index
      }));
      
      return { ...newSectionData, items: mappedItems };

    } catch (err: any) {
      console.error('Error creating product section:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao criar a seção de produtos.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      // Attempt to clean up if section was created but items failed?
      // Consider more robust transaction handling if possible
      setLoading(false);
      return null;
    }
  }, [toast, fetchSections]);

  const updateSection = useCallback(async (sectionInput: ProductSectionInput): Promise<ProductSection | null> => {
    if (!sectionInput.id) {
      toast({ title: 'Erro', description: 'ID da seção é necessário para atualização.', variant: 'destructive' });
      return null;
    }
    setLoading(true);
    setError(null);
    const sectionId = sectionInput.id;

    try {
      // 1. Update section details
      const { error: sectionUpdateError } = await supabase
        .from('product_sections')
        .update({
          title: sectionInput.title,
          title_part1: sectionInput.title_part1,
          title_part2: sectionInput.title_part2,
          title_color1: sectionInput.title_color1,
          title_color2: sectionInput.title_color2,
          view_all_link: sectionInput.view_all_link,
          updated_at: new Date().toISOString(), // Manually update timestamp
        })
        .eq('id', sectionId);

      if (sectionUpdateError) throw sectionUpdateError;

      // 2. Replace section items (delete old, insert new)
      const { error: deleteError } = await supabase
        .from('product_section_items')
        .delete()
        .eq('section_id', sectionId);

      if (deleteError) throw deleteError;

      if (sectionInput.items && sectionInput.items.length > 0) {
        const itemsToInsert = sectionInput.items.map((item, index) => ({
          section_id: sectionId,
          item_type: item.type,
          item_id: item.id,
          display_order: index,
        }));
        const { error: itemsInsertError } = await supabase
          .from('product_section_items')
          .insert(itemsToInsert);
        if (itemsInsertError) throw itemsInsertError;
      }
      
      // 3. Update title in homepage_layout if necessary (optional, title is fetched dynamically there)
      // We might not need to update homepage_layout here unless the key changes (which it shouldn't)

      toast({ title: 'Sucesso', description: 'Seção de produtos atualizada.' });
      await fetchSections(); // Refetch
      // Find the updated section in the newly fetched list
      const updatedSection = sections.find(s => s.id === sectionId);
      return updatedSection || null; // Return updated data

    } catch (err: any) {
      console.error('Error updating product section:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao atualizar a seção de produtos.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      setLoading(false);
      return null;
    }
  }, [toast, fetchSections, sections]); // Added sections dependency for return value

  const deleteSection = useCallback(async (sectionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // 1. Delete from homepage_layout first (to avoid foreign key issues if cascade isn't immediate)
      const sectionKey = `product_section_${sectionId}`;
      const { error: layoutDeleteError } = await supabase
        .from('homepage_layout')
        .delete()
        .eq('section_key', sectionKey);

      // Log error but continue, maybe it was already removed
      if (layoutDeleteError) {
         console.warn('Could not delete section from layout:', layoutDeleteError.message);
         // toast({ title: 'Aviso', description: 'Não foi possível remover a seção do layout da home.', variant: 'default' });
      }

      // 2. Delete the section (should cascade to items)
      const { error: sectionDeleteError } = await supabase
        .from('product_sections')
        .delete()
        .eq('id', sectionId);

      if (sectionDeleteError) throw sectionDeleteError;

      toast({ title: 'Sucesso', description: 'Seção de produtos removida.' });
      await fetchSections(); // Refetch
      return true;

    } catch (err: any) {
      console.error('Error deleting product section:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Falha ao remover a seção de produtos.';
      setError(errorMessage);
      toast({ title: 'Erro', description: errorMessage, variant: 'destructive' });
      setLoading(false);
      return false;
    }
  }, [toast, fetchSections]);

  // Initial fetch
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return { sections, loading, error, fetchSections, createSection, updateSection, deleteSection };
};

