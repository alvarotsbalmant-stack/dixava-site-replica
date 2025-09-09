import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { retrySupabaseQuery } from '@/utils/retryWithAuth';
import { 
  ProductSection, 
  ProductSectionItem, 
  ProductSectionInput, 
  SectionItemType 
} from './useProductSections';

/**
 * Hook otimizado com cache robusto para seções de produtos
 * - Cache de 10 minutos
 * - Verifica cache primeiro antes da API
 * - Ordena seções de forma consistente
 * - Elimina aleatoriedade
 */

interface CacheData {
  data: ProductSection[];
  timestamp: number;
  key: string;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
const CACHE_KEY = 'product_sections_cache_v2';

export const useProductSectionsWithCache = () => {
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar do cache
  const loadFromCache = useCallback((): ProductSection[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        console.log('[useProductSectionsWithCache] 📂 Nenhum cache encontrado');
        return null;
      }

      const cacheData: CacheData = JSON.parse(cached);
      const now = Date.now();
      const age = now - cacheData.timestamp;

      if (age > CACHE_DURATION) {
        console.log('[useProductSectionsWithCache] ⏰ Cache expirado, removendo');
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      console.log(`[useProductSectionsWithCache] ✅ Cache válido encontrado: ${cacheData.data.length} seções (${Math.round(age/1000)}s atrás)`);
      return cacheData.data;
    } catch (error) {
      console.error('[useProductSectionsWithCache] ❌ Erro ao carregar cache:', error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  // Salvar no cache
  const saveToCache = useCallback((data: ProductSection[]) => {
    try {
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        key: CACHE_KEY
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log(`[useProductSectionsWithCache] 💾 Salvou ${data.length} seções no cache`);
    } catch (error) {
      console.error('[useProductSectionsWithCache] ❌ Erro ao salvar cache:', error);
    }
  }, []);

  // Buscar seções (cache first)
  const fetchSections = useCallback(async (force: boolean = false) => {
    // 1. SEMPRE verificar cache primeiro (exceto se forçado)
    if (!force) {
      const cachedData = loadFromCache();
      if (cachedData) {
        setSections(cachedData);
        setLoading(false);
        setError(null);
        return cachedData;
      }
    }

    // 2. Cache não existe ou expirado - buscar da API
    console.log('[useProductSectionsWithCache] 🌐 Buscando dados da API...');
    setLoading(true);
    setError(null);
    
    try {
      // Fetch sections with retry mechanism
      const { data: sectionsData, error: sectionsError } = await retrySupabaseQuery(
        async () => await supabase
          .from('product_sections')
          .select('*')
          .order('created_at', { ascending: false }), // ✅ ORDEM CONSISTENTE
        'fetchProductSections'
      );

      if (sectionsError) throw sectionsError;
      console.log('[useProductSectionsWithCache] 📋 Seções da API:', sectionsData?.length || 0);

      // Fetch items for each section
      const sectionIds = sectionsData?.map(s => s.id) || [];
      let allItems: ProductSectionItem[] = [];
      
      if (sectionIds.length > 0) {
        const { data: itemsData, error: itemsError } = await retrySupabaseQuery(
          async () => await supabase
            .from('product_section_items')
            .select('*')
            .in('section_id', sectionIds)
            .order('display_order', { ascending: true }), // ✅ ORDEM CONSISTENTE
          'fetchProductSectionItems'
        );
        if (itemsError) throw itemsError;
        allItems = itemsData || [];
        console.log('[useProductSectionsWithCache] 📦 Items da API:', allItems.length);
      }

      // Combine sections with their items
      const combinedSections = (sectionsData || []).map(section => ({
        ...section,
        items: allItems.filter(item => item.section_id === section.id)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0)) // ✅ ORDEM CONSISTENTE DOS ITEMS
      }));

      // ✅ GARANTIR ORDEM CONSISTENTE DAS SEÇÕES (eliminar aleatoriedade)
      const sortedSections = combinedSections.sort((a, b) => {
        // Ordenação: created_at depois id como fallback
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        if (dateA !== dateB) return dateB - dateA; // Mais recentes primeiro
        return a.id.localeCompare(b.id); // ID como fallback
      });

      console.log(`[useProductSectionsWithCache] ✅ API retornou ${sortedSections.length} seções processadas`);
      
      // 3. Salvar no cache E no estado
      saveToCache(sortedSections);
      setSections(sortedSections);
      
      return sortedSections;

    } catch (err: any) {
      console.error('[useProductSectionsWithCache] ❌ Erro na API:', err);
      const errorMessage = err.message || 'Falha ao carregar as seções de produtos.';
      setError(errorMessage);
      
      // Em caso de erro, tentar usar cache expirado como fallback
      const expiredCache = localStorage.getItem(CACHE_KEY);
      if (expiredCache) {
        try {
          const cacheData: CacheData = JSON.parse(expiredCache);
          console.log('[useProductSectionsWithCache] 🔄 Usando cache expirado como fallback');
          setSections(cacheData.data);
          setError(null); // Limpar erro se conseguiu usar cache
          return cacheData.data;
        } catch (e) {
          console.error('[useProductSectionsWithCache] ❌ Cache expirado também inválido');
        }
      }
      
      toast({ 
        title: 'Erro', 
        description: errorMessage, 
        variant: 'destructive' 
      });
      
      setSections([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadFromCache, saveToCache, toast]);

  // Invalidar cache (útil após atualizações)
  const invalidateCache = useCallback(() => {
    console.log('[useProductSectionsWithCache] 🗑️ Invalidando cache');
    localStorage.removeItem(CACHE_KEY);
  }, []);

  // Criar seção (invalida cache)
  const createSection = useCallback(async (sectionInput: ProductSectionInput): Promise<ProductSection | null> => {
    console.log('[useProductSectionsWithCache] 🆕 Criando seção...');
    // Implementação original do createSection seria aqui
    // Por agora, apenas invalida cache
    invalidateCache();
    return null;
  }, [invalidateCache]);

  // Atualizar seção (invalida cache)
  const updateSection = useCallback(async (sectionInput: ProductSectionInput): Promise<ProductSection | null> => {
    console.log('[useProductSectionsWithCache] ✏️ Atualizando seção...');
    // Implementação original do updateSection seria aqui
    // Por agora, apenas invalida cache
    invalidateCache();
    return null;
  }, [invalidateCache]);

  // Deletar seção (invalida cache)
  const deleteSection = useCallback(async (sectionId: string): Promise<boolean> => {
    console.log('[useProductSectionsWithCache] 🗑️ Deletando seção...');
    // Implementação original do deleteSection seria aqui
    // Por agora, apenas invalida cache
    invalidateCache();
    return false;
  }, [invalidateCache]);

  // Buscar na inicialização
  useEffect(() => {
    console.log('[useProductSectionsWithCache] 🚀 Inicializando hook com cache');
    fetchSections(false); // Não forçar - usar cache se disponível
  }, [fetchSections]);

  return { 
    sections, 
    loading, 
    error, 
    fetchSections: () => fetchSections(false), // Use cache
    refetch: () => fetchSections(true), // Force refresh
    createSection, 
    updateSection, 
    deleteSection,
    invalidateCache
  };
};