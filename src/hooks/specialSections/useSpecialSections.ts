// Fix the useSpecialSections hook to work with actual database schema
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

// Use the actual database types
type SpecialSectionRow = Database["public"]["Tables"]["special_sections"]["Row"];

export interface SpecialSection extends SpecialSectionRow {
  // Extend with computed properties if needed
}

export interface CreateSectionRequest {
  title: string;
  description?: string;
  background_type?: string;
  background_color?: string;
  background_gradient?: string;
  background_image_url?: string;
  background_image_position?: string;
  background_value?: string;
  content_config?: any;
  is_active?: boolean;
  display_order?: number;
  title_color1?: string;
  title_color2?: string;
  title_part1?: string;
  title_part2?: string;
  padding_top?: number;
  padding_bottom?: number;
  padding_left?: number;
  padding_right?: number;
  margin_top?: number;
  margin_bottom?: number;
  border_radius?: number;
  mobile_settings?: any;
}

export interface UpdateSectionRequest {
  id: string;
  title?: string;
  description?: string;
  background_type?: string;
  background_color?: string;
  background_gradient?: string;
  background_image_url?: string;
  background_image_position?: string;
  background_value?: string;
  content_config?: any;
  is_active?: boolean;
  display_order?: number;
  title_color1?: string;
  title_color2?: string;
  title_part1?: string;
  title_part2?: string;
  padding_top?: number;
  padding_bottom?: number;
  padding_left?: number;
  padding_right?: number;
  margin_top?: number;
  margin_bottom?: number;
  border_radius?: number;
  mobile_settings?: any;
  [key: string]: any;
}

export interface DragDropItem {
  id: string;
  order?: number;
}

export interface UseSectionsOptions {
  page?: number;
  limit?: number;
  type?: string;
  visibility?: string;
}

export interface UseSectionsReturn {
  sections: SpecialSection[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  refetch: () => Promise<void>;
  createSection: (data: CreateSectionRequest) => Promise<SpecialSection>;
  updateSection: (data: UpdateSectionRequest) => Promise<SpecialSection>;
  deleteSection: (id: string) => Promise<void>;
  reorderSections: (items: DragDropItem[]) => Promise<void>;
}

export const useSpecialSections = (options: UseSectionsOptions = {}): UseSectionsReturn => {
  const {
    page = 1,
    limit = 20,
    type,
    visibility
  } = options;

  // Estado principal
  const [sections, setSections] = useState<SpecialSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // Função para buscar seções com filtros
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('special_sections')
        .select('*', { count: 'exact' })
        .order('display_order', { ascending: true })
        .range((page - 1) * limit, page * limit - 1);

      // Aplicar filtros
      if (type) {
        query = query.eq('background_type', type);
      }
      
      if (visibility) {
        query = query.eq('is_active', visibility === 'visible');
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setSections(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error('Erro ao buscar seções:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast.error('Erro ao carregar seções especiais');
    } finally {
      setLoading(false);
    }
  }, [page, limit, type, visibility]);

  // Função para criar seção
  const createSection = useCallback(async (data: CreateSectionRequest): Promise<SpecialSection> => {
    try {
      const { data: newSection, error: createError } = await supabase
        .from('special_sections')
        .insert([data])
        .select()
        .single();

      if (createError) throw createError;
      
      await fetchSections();
      toast.success('Seção criada com sucesso!');
      return newSection;
    } catch (err) {
      console.error('Erro ao criar seção:', err);
      toast.error('Erro ao criar seção');
      throw err;
    }
  }, [fetchSections]);

  // Função para atualizar seção
  const updateSection = useCallback(async (data: UpdateSectionRequest): Promise<SpecialSection> => {
    try {
      const { id, ...updateData } = data;
      const { data: updatedSection, error: updateError } = await supabase
        .from('special_sections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      await fetchSections();
      toast.success('Seção atualizada com sucesso!');
      return updatedSection;
    } catch (err) {
      console.error('Erro ao atualizar seção:', err);
      toast.error('Erro ao atualizar seção');
      throw err;
    }
  }, [fetchSections]);

  // Função para deletar seção
  const deleteSection = useCallback(async (id: string): Promise<void> => {
    try {
      const { error: deleteError } = await supabase
        .from('special_sections')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      await fetchSections();
      toast.success('Seção removida com sucesso!');
    } catch (err) {
      console.error('Erro ao deletar seção:', err);
      toast.error('Erro ao remover seção');
      throw err;
    }
  }, [fetchSections]);

  // Função para reordenar seções
  const reorderSections = useCallback(async (items: DragDropItem[]): Promise<void> => {
    try {
      // Update display_order for each section
      const updates = items.map((item, index) => ({
        id: item.id,
        display_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('special_sections')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      
      await fetchSections();
      toast.success('Ordem das seções atualizada!');
    } catch (err) {
      console.error('Erro ao reordenar seções:', err);
      toast.error('Erro ao reordenar seções');
      throw err;
    }
  }, [fetchSections]);

  // Carregar seções ao montar o componente ou quando as opções mudarem
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Preparar valor de retorno do hook
  const returnValue: UseSectionsReturn = useMemo(() => ({
    sections,
    loading,
    error,
    total,
    page,
    limit,
    refetch: fetchSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections
  }), [
    sections,
    loading,
    error,
    total,
    page,
    limit,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections
  ]);

  return returnValue;
};

// Hook for section preview functionality
export const useSectionPreview = () => {
  const [previewSection, setPreviewSection] = useState<SpecialSection | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const startPreview = useCallback((section: SpecialSection) => {
    setPreviewSection(section);
    setIsPreviewMode(true);
  }, []);

  const stopPreview = useCallback(() => {
    setPreviewSection(null);
    setIsPreviewMode(false);
  }, []);

  const updatePreview = useCallback((section: SpecialSection) => {
    if (isPreviewMode) {
      setPreviewSection(section);
    }
  }, [isPreviewMode]);

  return {
    previewSection,
    isPreviewMode,
    startPreview,
    stopPreview,
    updatePreview
  };
};