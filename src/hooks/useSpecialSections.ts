import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast'; // Corrected import path
import { supabase } from '@/integrations/supabase/client';
import { SpecialSection, SpecialSectionCreateInput, SpecialSectionUpdateInput } from '@/types/specialSections';
import { Database } from '@/integrations/supabase/types';

export const useSpecialSections = (options?: any) => {
  const [specialSections, setSpecialSections] = useState<Database['public']['Tables']['special_sections']['Row'][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSpecialSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime();
      console.log(`[useSpecialSections] Fetching at ${timestamp}`);
      
      const { data, error: fetchError } = await supabase
        .from('special_sections')
        .select(`
          *,
          carousel_title_color,
          view_all_button_bg_color,
          view_all_button_text_color,
          scrollbar_color,
          scrollbar_hover_color
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Dados já vêm tipados corretamente do banco
      const sectionsData = (data || []) as Database['public']['Tables']['special_sections']['Row'][];
      
      console.log(`[useSpecialSections] Loaded ${sectionsData.length} sections:`, sectionsData);
      setSpecialSections(sectionsData as any);
    } catch (err: any) {
      console.error('Error fetching special sections:', err);
      setError('Falha ao carregar as seções especiais.');
      toast({ title: 'Erro', description: 'Não foi possível carregar as seções especiais.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Function to add the section to homepage_layout
  const addSectionToLayout = async (sectionId: string) => {
    try {
      // Get the current max display_order
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('homepage_layout')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      if (maxOrderError && maxOrderError.code !== 'PGRST116') { // Ignore 'range not found' error if table is empty
          throw maxOrderError;
      }
      
      const nextOrder = maxOrderData ? maxOrderData.display_order + 1 : 0;

      // Verificar se a seção já existe no layout para evitar duplicação
      const { data: existingSection, error: checkError } = await supabase
        .from('homepage_layout')
        .select('id')
        .eq('section_key', `special_section_${sectionId}`)
        .maybeSingle();

      if (checkError) throw checkError;

      // Se a seção já existe, não insira novamente
      if (existingSection) {
        console.log(`Special section ${sectionId} already exists in homepage_layout`);
        return;
      }

      const { error: layoutInsertError } = await supabase
        .from('homepage_layout')
        .insert({
          section_key: `special_section_${sectionId}`,
          display_order: nextOrder,
          is_visible: true, // Default to visible when created
        });

      if (layoutInsertError) throw layoutInsertError;

      console.log(`Special section ${sectionId} added to homepage_layout`);

    } catch (error: any) {
      console.error('Failed to add special section to layout:', error);
      // Don't block the main operation, but log the error
      toast({
        title: 'Aviso: Falha ao adicionar seção ao layout da home',
        description: `A seção foi criada, mas pode não aparecer na organização da página inicial. Erro: ${error.message}`,
        variant: 'default', // Use default or warning variant
        duration: 7000, 
      });
    }
  };

  const addSpecialSection = async (sectionData: any) => {
    // Remove display_order if it exists in the input, as it's managed by homepage_layout
    const { display_order, ...dataToInsert } = sectionData as any; 

    try {
      const { data: newSection, error } = await supabase
        .from('special_sections')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) throw error;
      if (!newSection) throw new Error('Failed to create special section, no data returned.');

      // **Add to homepage_layout after successful creation**
      await addSectionToLayout(newSection.id);

      await fetchSpecialSections(); // Refetch to update the list

      toast({
        title: 'Seção especial criada com sucesso!',
      });
      return newSection;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar seção especial',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateSpecialSection = async (id: string, updates: any) => {
     // Remove display_order if it exists in the input
    const { display_order, ...dataToUpdate } = updates as any;
    try {
      const { data, error } = await supabase
        .from('special_sections')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchSpecialSections();

      toast({
        title: 'Seção especial atualizada com sucesso!',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar seção especial',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Function to remove the section from homepage_layout
  const removeSectionFromLayout = async (sectionId: string) => {
      try {
          const { error: layoutDeleteError } = await supabase
              .from('homepage_layout')
              .delete()
              .eq('section_key', `special_section_${sectionId}`);
          
          if (layoutDeleteError) throw layoutDeleteError;
          console.log(`Special section ${sectionId} removed from homepage_layout`);
      } catch (error: any) {
          console.error('Failed to remove special section from layout:', error);
          // Log error but don't block deletion of the section itself
          toast({
              title: 'Aviso: Falha ao remover seção do layout da home',
              description: `A seção foi excluída, mas pode ainda aparecer temporariamente na organização da página inicial. Erro: ${error.message}`,
              variant: 'default',
              duration: 7000,
          });
      }
  };

  const deleteSpecialSection = async (id: string) => {
    try {
      // First, remove from layout to avoid foreign key issues if any (or just dangling refs)
      await removeSectionFromLayout(id);

      // Then, delete the section itself
      const { error } = await supabase
        .from('special_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSpecialSections();

      toast({
        title: 'Seção especial removida com sucesso!',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover seção especial',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Função para forçar refresh dos dados (útil após salvar no admin)
  const forceRefresh = useCallback(async () => {
    console.log('[useSpecialSections] Force refresh triggered');
    await fetchSpecialSections();
  }, [fetchSpecialSections]);

  useEffect(() => {
    fetchSpecialSections();
  }, [fetchSpecialSections]);

  return {
    sections: specialSections,
    specialSections: specialSections,
    loading,
    error,
    total: specialSections.length,
    refetch: fetchSpecialSections,
    forceRefresh,
    createSection: addSpecialSection,
    updateSection: updateSpecialSection,
    deleteSection: deleteSpecialSection,
    reorderSections: async (items: any[]) => {
      // Implement reordering logic
      console.log('Reordering sections:', items);
    },
  };
};
