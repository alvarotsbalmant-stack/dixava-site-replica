import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductFAQ {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  helpful_count: number;
  active: boolean;
  order_index: number;
  created_at: string;
}

export interface FAQCategory {
  category: string;
  faqs: ProductFAQ[];
}

export const useProductFAQs = (productId: string) => {
  const [faqs, setFaqs] = useState<ProductFAQ[]>([]);
  const [categorizedFaqs, setCategorizedFaqs] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      loadFAQs();
    }
  }, [productId]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('product_faqs')
        .select('*')
        .eq('product_id', productId)
        .eq('active', true)
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });

      if (error) throw error;

      const processedData = (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        question: item.question,
        answer: item.answer,
        category: item.category || 'Geral',
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
        helpful_count: item.helpful_count || 0,
        active: item.active || true,
        order_index: item.order_index || 0,
        created_at: item.created_at || new Date().toISOString()
      } as ProductFAQ));

      setFaqs(processedData);
      
      // Categorizar FAQs
      const categories = groupFAQsByCategory(processedData);
      setCategorizedFaqs(categories);
    } catch (error) {
      console.error('Erro ao carregar FAQs:', error);
      setFaqs([]);
      setCategorizedFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const groupFAQsByCategory = (faqs: ProductFAQ[]): FAQCategory[] => {
    const categoryMap = new Map<string, ProductFAQ[]>();
    
    faqs.forEach(faq => {
      const category = faq.category || 'Geral';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(faq);
    });

    return Array.from(categoryMap.entries()).map(([category, faqs]) => ({
      category,
      faqs: faqs.sort((a, b) => a.order_index - b.order_index)
    }));
  };

  const addFAQ = async (faq: Omit<ProductFAQ, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('product_faqs')
        .insert([faq])
        .select()
        .single();

      if (error) throw error;

      await loadFAQs();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao adicionar FAQ:', error);
      return { success: false, error };
    }
  };

  const updateFAQ = async (id: string, updates: Partial<ProductFAQ>) => {
    try {
      const { error } = await supabase
        .from('product_faqs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadFAQs();
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar FAQ:', error);
      return { success: false, error };
    }
  };

  const incrementHelpfulCount = async (id: string) => {
    try {
      // Buscar o FAQ atual para incrementar o contador
      const { data: currentFAQ, error: fetchError } = await supabase
        .from('product_faqs')
        .select('helpful_count')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('product_faqs')
        .update({ helpful_count: (currentFAQ.helpful_count || 0) + 1 })
        .eq('id', id);

      if (error) throw error;

      await loadFAQs();
      return { success: true };
    } catch (error) {
      console.error('Erro ao incrementar contador útil:', error);
      return { success: false, error };
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadFAQs();
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar FAQ:', error);
      return { success: false, error };
    }
  };

  return {
    faqs,
    categorizedFaqs,
    loading,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    incrementHelpfulCount,
    refreshFAQs: loadFAQs
  };
};