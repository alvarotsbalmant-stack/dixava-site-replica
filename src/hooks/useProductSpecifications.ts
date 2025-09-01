import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSpecification {
  id: string;
  product_id: string;
  category: string;
  label: string;
  value: string;
  highlight: boolean;
  order_index: number;
  icon?: string; // Emoji, Lucide icon name, ou URL
}

export interface SpecificationCategory {
  category: string;
  items: ProductSpecification[];
}

export const useProductSpecifications = (productId: string, viewType: 'mobile' | 'desktop' = 'desktop', product?: any) => {
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [categorizedSpecs, setCategorizedSpecs] = useState<SpecificationCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadSpecifications();
    }
  }, [productId, viewType]);

  const loadSpecifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('product_specifications')
        .select('*')
        .eq('product_id', productId)
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;

      const filteredData = filterSpecificationsByViewType(data || [], viewType);
      setSpecifications(filteredData);
      
      // Categorizar especificações
      const categories = groupSpecificationsByCategory(filteredData);
      setCategorizedSpecs(categories);
    } catch (error) {
      console.error('Erro ao carregar especificações:', error);
      setSpecifications([]);
      setCategorizedSpecs([]);
    } finally {
      setLoading(false);
    }
  };

  const detectTechnicalProduct = (product?: any): boolean => {
    if (!product) return true; // Default para técnico se não há produto
    
    const technicalCategories = [
      'games', 'jogos', 'consoles', 'periféricos', 
      'eletrônicos', 'computadores', 'smartphones',
      'acessórios gaming', 'hardware'
    ];
    
    const technicalKeywords = [
      'playstation', 'xbox', 'nintendo', 'pc', 'gamer', 
      'gaming', 'console', 'mouse', 'teclado', 'headset',
      'monitor', 'placa', 'processador', 'smartphone'
    ];
    
    const category = (product.category || '').toLowerCase();
    const name = (product.name || product.product_name || '').toLowerCase();
    
    // Verificar categoria
    if (technicalCategories.some(cat => category.includes(cat))) {
      return true;
    }
    
    // Verificar palavras-chave no nome
    if (technicalKeywords.some(keyword => name.includes(keyword))) {
      return true;
    }
    
    return false;
  };

  const filterSpecificationsByViewType = (specs: ProductSpecification[], type: 'mobile' | 'desktop'): ProductSpecification[] => {
    if (type === 'mobile') {
      // Mobile: apenas especificações básicas (categoria "Informações Gerais")
      return specs.filter(spec => spec.category === 'Informações Gerais');
    } else {
      // Desktop: detectar se é produto técnico
      const isTechnicalProduct = detectTechnicalProduct(product);
      
      if (isTechnicalProduct) {
        // Produtos técnicos: usar especificações técnicas específicas
        const desktopCategories = [
          '⚙️ Especificações Técnicas',
          '🚀 Performance', 
          '💾 Armazenamento',
          '🔌 Conectividade'
        ];
        return specs.filter(spec => desktopCategories.includes(spec.category));
      } else {
        // Produtos não-técnicos: usar as mesmas especificações do mobile
        return specs.filter(spec => spec.category === 'Informações Gerais');
      }
    }
  };

  const groupSpecificationsByCategory = (specs: ProductSpecification[]): SpecificationCategory[] => {
    const categoryMap = new Map<string, ProductSpecification[]>();
    
    specs.forEach((spec) => {
      if (!categoryMap.has(spec.category)) {
        categoryMap.set(spec.category, []);
      }
      categoryMap.get(spec.category)!.push(spec);
    });

    const result = Array.from(categoryMap.entries()).map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.order_index - b.order_index)
    }));
    
    return result;
  };

  const addSpecification = async (spec: Omit<ProductSpecification, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('product_specifications')
        .insert([spec])
        .select()
        .single();

      if (error) throw error;

      await loadSpecifications();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao adicionar especificação:', error);
      return { success: false, error };
    }
  };

  const updateSpecification = async (id: string, updates: Partial<ProductSpecification>) => {
    try {
      const { error } = await supabase
        .from('product_specifications')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadSpecifications();
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar especificação:', error);
      return { success: false, error };
    }
  };

  const deleteSpecification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_specifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadSpecifications();
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar especificação:', error);
      return { success: false, error };
    }
  };

  return {
    specifications,
    categorizedSpecs,
    loading,
    addSpecification,
    updateSpecification,
    deleteSpecification,
    refreshSpecifications: loadSpecifications
  };
};