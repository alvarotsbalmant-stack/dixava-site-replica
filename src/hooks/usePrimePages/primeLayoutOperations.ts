
import { PrimePageLayoutItem } from './types';
import { supabase } from '@/integrations/supabase/client';

export const createPrimeLayoutOperations = (
  pageLayouts: Record<string, PrimePageLayoutItem[]>,
  setPageLayouts: React.Dispatch<React.SetStateAction<Record<string, PrimePageLayoutItem[]>>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const fetchPageLayout = async (pageId: string) => {
    try {
      console.log("Fetching prime page layout for pageId:", pageId);
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pageId)) {
        console.error("Invalid UUID format for pageId:", pageId);
        setError(`ID da página inválido: ${pageId}`);
        return [];
      }

      const { data, error } = await supabase
        .from("prime_page_layout")
        .select("*")
        .eq("page_id", pageId)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Fetched prime layout data:", data);

      const mappedData: PrimePageLayoutItem[] = (data || []).map(item => ({
        id: item.id,
        page_id: item.page_id,
        section_type: item.section_type,
        section_key: item.section_key,
        display_order: item.display_order,
        is_visible: item.is_visible,
        section_config: item.section_config,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log("Mapped prime layout data:", mappedData);

      setPageLayouts((prev) => ({ ...prev, [pageId]: mappedData }));
      setError(null);
      return mappedData;
    } catch (err: any) {
      console.error("Error in fetchPageLayout:", err);
      setError(`Erro ao carregar layout da página Prime ${pageId}: ${err.message}`);
      return [];
    }
  };

  const updatePageLayout = async (pageId: string, layoutItems: Partial<PrimePageLayoutItem>[]) => {
    try {
      console.log("Updating prime page layout for pageId:", pageId, "with items:", layoutItems);
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pageId)) {
        console.error("Invalid UUID format for pageId:", pageId);
        throw new Error(`ID da página inválido: ${pageId}`);
      }
      
      const updates = layoutItems.map(item => ({
        id: item.id,
        page_id: pageId,
        section_type: item.section_type,
        section_key: item.section_key,
        display_order: item.display_order,
        is_visible: item.is_visible,
        section_config: item.section_config
      }));

      console.log("Mapped updates for database:", updates);

      const { error } = await supabase
        .from("prime_page_layout")
        .upsert(updates, { onConflict: "id" });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      const mappedItems = layoutItems.map(item => ({
        id: item.id || '',
        page_id: pageId,
        section_type: item.section_type || '',
        section_key: item.section_key || '',
        display_order: item.display_order || 0,
        is_visible: item.is_visible || true,
        section_config: item.section_config || {},
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));

      setPageLayouts(prev => ({ ...prev, [pageId]: mappedItems as PrimePageLayoutItem[] }));
      console.log("Successfully updated prime page layout");
      return mappedItems;
    } catch (err: any) {
      console.error("Error in updatePageLayout:", err);
      setError(`Erro ao atualizar layout da página Prime ${pageId}: ${err.message}`);
      throw err;
    }
  };

  const addPageSection = async (pageId: string, section: Omit<PrimePageLayoutItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("Adding new section to prime pageId:", pageId, "section:", section);
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pageId)) {
        console.error("Invalid UUID format for pageId:", pageId);
        throw new Error(`ID da página inválido: ${pageId}`);
      }
      
      const dbSection = {
        page_id: pageId,
        section_type: section.section_type,
        section_key: section.section_key,
        display_order: section.display_order,
        is_visible: section.is_visible,
        section_config: section.section_config
      };

      console.log("Mapped section for database insert:", dbSection);

      const { data, error } = await supabase
        .from("prime_page_layout")
        .insert(dbSection)
        .select()
        .single();

      if (error) {
        console.error("Database insert error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Nenhum dado retornado após inserção");
      }

      console.log("Successfully inserted prime section:", data);
      
      const mappedSection: PrimePageLayoutItem = {
        id: data.id,
        page_id: data.page_id,
        section_type: data.section_type,
        section_key: data.section_key,
        display_order: data.display_order,
        is_visible: data.is_visible,
        section_config: data.section_config,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setPageLayouts((prev) => ({
        ...prev,
        [pageId]: [...(prev[pageId] || []), mappedSection],
      }));
      
      return mappedSection;
    } catch (err: any) {
      console.error("Error in addPageSection:", err);
      setError(`Erro ao adicionar seção à página Prime ${pageId}: ${err.message}`);
      throw err;
    }
  };

  const removePageSection = async (pageId: string, sectionId: string) => {
    try {
      console.log("Removing section:", sectionId, "from prime pageId:", pageId);
      
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pageId)) {
        console.error("Invalid UUID format for pageId:", pageId);
        throw new Error(`ID da página inválido: ${pageId}`);
      }
      if (!uuidRegex.test(sectionId)) {
        console.error("Invalid UUID format for sectionId:", sectionId);
        throw new Error(`ID da seção inválido: ${sectionId}`);
      }
      
      const { error } = await supabase
        .from("prime_page_layout")
        .delete()
        .eq("id", sectionId)
        .eq("page_id", pageId);

      if (error) {
        console.error("Database delete error:", error);
        throw error;
      }

      setPageLayouts((prev) => ({
        ...prev,
        [pageId]: prev[pageId]?.filter((item) => item.id !== sectionId) || [],
      }));
      
      console.log("Successfully removed prime section");
      return true;
    } catch (err: any) {
      console.error("Error in removePageSection:", err);
      setError(`Erro ao remover seção ${sectionId} da página Prime ${pageId}: ${err.message}`);
      throw err;
    }
  };

  return {
    fetchPageLayout,
    updatePageLayout,
    addPageSection,
    removePageSection
  };
};
