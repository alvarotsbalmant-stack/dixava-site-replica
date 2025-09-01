
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProductImageManager = () => {
  const [loading, setLoading] = useState(false);

  const updateProductImage = async (productId: string, imageUrl: string | null, isMainImage: boolean) => {
    setLoading(true);
    
    try {
      console.log('Atualizando apenas imagem:', { productId, imageUrl, isMainImage });
      
      // Preparar update específico apenas para imagens
      const updates: { image?: string | null; additional_images?: string[] } = {};
      
      if (isMainImage) {
        updates.image = imageUrl;
      } else {
        // Para imagens secundárias, primeiro buscar o estado atual
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('additional_images')
          .eq('id', productId)
          .single();

        if (fetchError) {
          console.error('Erro ao buscar produto:', fetchError);
          throw new Error(`Erro ao buscar produto: ${fetchError.message}`);
        }

        const currentImages = Array.isArray(currentProduct.additional_images) 
          ? currentProduct.additional_images 
          : [];

        if (imageUrl && !currentImages.includes(imageUrl)) {
          // Adicionar nova imagem
          updates.additional_images = [...currentImages, imageUrl];
        }
      }

      console.log('Updates que serão enviados (apenas imagens):', updates);
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(`Erro ao atualizar produto: ${error.message}`);
      }

      console.log('Produto atualizado com sucesso (apenas imagens):', data);
      return data;

    } catch (error) {
      console.error('Erro ao atualizar imagem do produto:', error);
      // Não usar toast aqui, deixar para o componente pai
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeProductImage = async (productId: string, imageUrl: string, isMainImage: boolean) => {
    setLoading(true);
    
    try {
      console.log('Removendo apenas imagem:', { productId, imageUrl, isMainImage });
      
      const updates: { image?: null; additional_images?: string[] } = {};
      
      if (isMainImage) {
        updates.image = null;
      } else {
        // Para imagens secundárias, primeiro buscar o estado atual
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('additional_images')
          .eq('id', productId)
          .single();

        if (fetchError) {
          console.error('Erro ao buscar produto:', fetchError);
          throw new Error(`Erro ao buscar produto: ${fetchError.message}`);
        }

        const currentImages = Array.isArray(currentProduct.additional_images) 
          ? currentProduct.additional_images 
          : [];

        updates.additional_images = currentImages.filter(img => img !== imageUrl);
      }

      console.log('Updates de remoção que serão enviados (apenas imagens):', updates);
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw new Error(`Erro ao remover imagem: ${error.message}`);
      }

      console.log('Imagem removida com sucesso:', data);
      return data;

    } catch (error) {
      console.error('Erro ao remover imagem do produto:', error);
      // Não usar toast aqui, deixar para o componente pai
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProductImage,
    removeProductImage,
    loading
  };
};
