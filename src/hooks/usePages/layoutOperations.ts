
import { PageLayoutItem } from './types';
import { supabase } from '@/integrations/supabase/client';

// Helper function to map database format to frontend format
const mapDbToFrontend = (dbItem: any): PageLayoutItem => ({
  id: dbItem.id,
  page_id: dbItem.page_id,
  section_key: dbItem.section_key,
  title: dbItem.title,
  display_order: dbItem.display_order,
  is_visible: dbItem.is_visible,
  section_type: dbItem.section_type,
  sectionConfig: dbItem.section_config,
  
  // Helper properties for backwards compatibility
  pageId: dbItem.page_id,
  sectionKey: dbItem.section_key,
  displayOrder: dbItem.display_order,
  isVisible: dbItem.is_visible,
  sectionType: dbItem.section_type,
});

// Helper function to map frontend format to database format
const mapFrontendToDb = (frontendItem: Partial<PageLayoutItem>) => ({
  id: frontendItem.id,
  page_id: frontendItem.page_id || frontendItem.pageId,
  section_key: frontendItem.section_key || frontendItem.sectionKey,
  title: frontendItem.title,
  display_order: frontendItem.display_order ?? frontendItem.displayOrder,
  is_visible: frontendItem.is_visible ?? frontendItem.isVisible,
  section_type: frontendItem.section_type || frontendItem.sectionType,
  section_config: frontendItem.sectionConfig,
});

// Utility functions for page layout operations
export const createLayoutOperations = (
  pageLayouts: Record<string, PageLayoutItem[]>,
  setPageLayouts: React.Dispatch<React.SetStateAction<Record<string, PageLayoutItem[]>>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  // Carregar layout de uma página específica
  const fetchPageLayout = async (pageId: string) => {
    try {
      console.log("Fetching layout for pageId:", pageId);
      
      // Validar se pageId é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pageId)) {
        console.error("Invalid UUID format for pageId:", pageId);
        setError(`ID da página inválido: ${pageId}`);
        return [];
      }

      const { data, error } = await supabase
        .from("page_layout_items")
        .select("*")
        .eq("page_id", pageId)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Fetched raw data:", data);

      const mappedData = (data || []).map(mapDbToFrontend);
      console.log("Mapped data:", mappedData);

      setPageLayouts((prev) => ({ ...prev, [pageId]: mappedData }));
      setError(null);
      return mappedData;
    } catch (err: any) {
      console.error("Error in fetchPageLayout:", err);
      setError(`Erro ao carregar layout da página ${pageId}: ${err.message}`);
      return [];
    }
  };

  // Atualizar layout de uma página
  const updatePageLayout = async (pageId: string, layoutItems: Partial<PageLayoutItem>[]) => {
    try {
      console.log("Updating page layout for pageId:", pageId, "with items:", layoutItems);
      
      // Validar se pageId é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pageId)) {
        console.error("Invalid UUID format for pageId:", pageId);
        throw new Error(`ID da página inválido: ${pageId}`);
      }
      
      const updates = layoutItems.map(item => mapFrontendToDb(item));
      console.log("Mapped updates for database:", updates);

      const { error } = await supabase
        .from("page_layout_items")
        .upsert(updates, { onConflict: "id" });

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Update local state with properly mapped items
      const mappedItems = layoutItems.map(item => mapDbToFrontend(mapFrontendToDb(item)));
      setPageLayouts(prev => ({ ...prev, [pageId]: mappedItems as PageLayoutItem[] }));
      console.log("Successfully updated page layout");
      return mappedItems;
    } catch (err: any) {
      console.error("Error in updatePageLayout:", err);
      setError(`Erro ao atualizar layout da página ${pageId}: ${err.message}`);
      throw err;
    }
  };

  // Adicionar uma nova seção ao layout
  const addPageSection = async (pageId: string, section: Omit<PageLayoutItem, 'id'>) => {
    try {
      console.log("Adding new section to pageId:", pageId, "section:", section);
      
      // Validar se pageId é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(pageId)) {
        console.error("Invalid UUID format for pageId:", pageId);
        throw new Error(`ID da página inválido: ${pageId}`);
      }
      
      // Convert frontend format to database format
      const dbSection = {
        page_id: pageId,
        section_key: section.section_key || section.sectionKey || `section-${Date.now()}`,
        title: section.title,
        display_order: section.display_order ?? section.displayOrder ?? 0,
        is_visible: section.is_visible ?? section.isVisible ?? true,
        section_type: section.section_type || section.sectionType || 'products',
        section_config: section.sectionConfig || {},
      };

      console.log("Mapped section for database insert:", dbSection);

      const { data, error } = await supabase
        .from("page_layout_items")
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

      console.log("Successfully inserted section:", data);
      
      const mappedSection = mapDbToFrontend(data);
      setPageLayouts((prev) => ({
        ...prev,
        [pageId]: [...(prev[pageId] || []), mappedSection],
      }));
      
      return mappedSection;
    } catch (err: any) {
      console.error("Error in addPageSection:", err);
      setError(`Erro ao adicionar seção à página ${pageId}: ${err.message}`);
      throw err;
    }
  };

  // Remover uma seção do layout
  const removePageSection = async (pageId: string, sectionId: string) => {
    try {
      console.log("Removing section:", sectionId, "from pageId:", pageId);
      
      // Validar se ambos IDs são UUIDs válidos
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
        .from("page_layout_items")
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
      
      console.log("Successfully removed section");
      return true;
    } catch (err: any) {
      console.error("Error in removePageSection:", err);
      setError(`Erro ao remover seção ${sectionId} da página ${pageId}: ${err.message}`);
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
