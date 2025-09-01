import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { Product, ProductSKU, MasterProduct, SKUNavigation, Platform } from '@/hooks/useProducts/types';
import { supabase } from '@/integrations/supabase/client';

// Configuração das plataformas suportadas
export const PLATFORM_CONFIG = {
  xbox: {
    id: 'xbox',
    name: 'Xbox',
    icon: '🎮',
    color: '#107C10'
  },
  playstation: {
    id: 'playstation',
    name: 'PlayStation',
    icon: '🎮',
    color: '#003791'
  },
  pc: {
    id: 'pc',
    name: 'PC',
    icon: '💻',
    color: '#FF6B00'
  },
  nintendo: {
    id: 'nintendo',
    name: 'Nintendo',
    icon: '🎮',
    color: '#E60012'
  },
  mobile: {
    id: 'mobile',
    name: 'Mobile',
    icon: '📱',
    color: '#34C759'
  }
};

// Cache local para navegação de SKUs
const skuNavigationCache = new Map<string, SKUNavigation>();

const useSKUs = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, fetchSingleProduct } = useProducts();

  // Buscar SKUs de um produto mestre
  const fetchSKUsForMaster = useCallback(async (masterProductId: string): Promise<ProductSKU[]> => {
    try {
      setLoading(true);
      
      // Buscar diretamente do banco ao invés de usar o cache local
      const { data, error } = await supabase
        .from('view_product_with_tags')
        .select('*')
        .eq('parent_product_id', masterProductId)
        .eq('product_type', 'sku');

      if (error) {
        console.error('Erro ao buscar SKUs:', error);
        return [];
      }

      // Mapear e agrupar por produto
      const skusMap = new Map<string, ProductSKU>();
      
      data?.forEach((row: any) => {
        const productId = row.product_id;
        
        if (!skusMap.has(productId)) {
          skusMap.set(productId, {
            id: row.product_id,
            name: row.product_name || '',
            description: row.product_description || '',
            price: Number(row.product_price) || 0,
            image: row.product_image || '',
            stock: row.product_stock || 0,
            parent_product_id: row.parent_product_id,
            product_type: 'sku',
            variant_attributes: row.variant_attributes || {},
            sku_code: row.sku_code,
            sort_order: row.sort_order || 0,
            is_active: row.is_active !== false,
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at || new Date().toISOString(),
            // Outros campos necessários...
            additional_images: row.additional_images || [],
            sizes: row.sizes || [],
            colors: row.colors || [],
            is_featured: false,
            is_master_product: false,
            available_variants: row.available_variants || {},
            inherit_from_master: row.inherit_from_master || {},
            product_videos: row.product_videos || [],
            product_faqs: row.product_faqs || [],
            product_highlights: row.product_highlights || [],
            reviews_config: row.reviews_config || {
              enabled: true,
              show_rating: true,
              show_count: true,
              allow_reviews: true,
              custom_rating: { value: 0, count: 0, use_custom: false }
            },
            trust_indicators: row.trust_indicators || [],
            manual_related_products: row.manual_related_products || [],
            breadcrumb_config: row.breadcrumb_config || {
              custom_path: [],
              use_custom: false,
              show_breadcrumb: true
            },
            product_descriptions: row.product_descriptions || {
              short: '',
              detailed: '',
              technical: '',
              marketing: ''
            },
            delivery_config: row.delivery_config || {
              custom_shipping_time: '',
              shipping_regions: [],
              express_available: false,
              pickup_locations: []
            },
            display_config: row.display_config || {
              show_stock_counter: true,
              show_view_counter: false,
              custom_view_count: 0,
              show_urgency_banner: false,
              urgency_text: '',
              show_social_proof: false,
              social_proof_text: ''
            },
            tags: []
          });
        }
      });

      const skus = Array.from(skusMap.values()).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      return skus;
    } catch (error) {
      console.error('Erro ao buscar SKUs:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar produto mestre usando o sistema existente
  const createMasterProduct = useCallback(async (productData: Partial<Product>): Promise<string | null> => {
    try {
      setLoading(true);
      
      const masterData = {
        name: productData.name || '',
        price: productData.price || 0,
        image: productData.image || '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
        description: productData.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_type: 'master' as const,
        is_master_product: true,
        available_variants: productData.available_variants || {},
        stock: 0,
        is_active: productData.is_active !== false,
        is_featured: productData.is_featured || false,
        pro_price: productData.pro_price,
        list_price: productData.list_price,
        additional_images: productData.additional_images || [],
        sizes: productData.sizes || [],
        colors: productData.colors || [],
        badge_text: productData.badge_text || '',
        badge_color: productData.badge_color || '#22c55e',
        badge_visible: productData.badge_visible || false,
        specifications: productData.specifications || [],
        technical_specs: productData.technical_specs || {},
        product_features: productData.product_features || {},
        shipping_weight: productData.shipping_weight,
        free_shipping: productData.free_shipping || false,
        meta_title: productData.meta_title || '',
        meta_description: productData.meta_description || '',
        slug: productData.slug || `${productData.name?.toLowerCase().replace(/\s+/g, '-')}-master-${Date.now()}`,
        // Novos campos de SKU
        parent_product_id: productData.parent_product_id,
        sku_code: productData.sku_code,
        variant_attributes: productData.variant_attributes || {},
        sort_order: productData.sort_order || 0,
        master_slug: productData.master_slug,
        inherit_from_master: productData.inherit_from_master || {},
        // Novos campos expandidos
        product_videos: productData.product_videos || [],
        product_faqs: productData.product_faqs || [],
        product_highlights: productData.product_highlights || [],
        reviews_config: productData.reviews_config || {
          enabled: true,
          show_rating: true,
          show_count: true,
          allow_reviews: true,
          custom_rating: { value: 0, count: 0, use_custom: false }
        },
        trust_indicators: productData.trust_indicators || [],
        manual_related_products: productData.manual_related_products || [],
        breadcrumb_config: productData.breadcrumb_config || {
          custom_path: [],
          use_custom: false,
          show_breadcrumb: true
        },
        product_descriptions: productData.product_descriptions || {
          short: '',
          detailed: '',
          technical: '',
          marketing: ''
        },
        delivery_config: productData.delivery_config || {
          custom_shipping_time: '',
          shipping_regions: [],
          express_available: false,
          pickup_locations: []
        },
        display_config: productData.display_config || {
          show_stock_counter: true,
          show_view_counter: false,
          custom_view_count: 0,
          show_urgency_banner: false,
          urgency_text: '',
          show_social_proof: false,
          social_proof_text: ''
        }
      };

      const result = await addProduct({
        ...masterData,
        tagIds: []
      });

      return result.id;
    } catch (error) {
      console.error('Erro ao criar produto mestre:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [addProduct]);

  // Criar SKU usando o sistema existente
  const createSKU = useCallback(async (skuData: Partial<Product>): Promise<string | null> => {
    try {
      setLoading(true);
      
      const sku = {
        name: skuData.name || '',
        price: skuData.price || 0,
        image: skuData.image || '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
        description: skuData.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        product_type: 'sku' as const,
        is_master_product: false,
        stock: skuData.stock || 0,
        is_active: skuData.is_active !== false,
        is_featured: false,
        pro_price: skuData.pro_price,
        list_price: skuData.list_price,
        additional_images: skuData.additional_images || [],
        sizes: skuData.sizes || [],
        colors: skuData.colors || [],
        badge_text: skuData.badge_text || '',
        badge_color: skuData.badge_color || '#22c55e',
        badge_visible: skuData.badge_visible || false,
        specifications: skuData.specifications || [],
        technical_specs: skuData.technical_specs || {},
        product_features: skuData.product_features || {},
        shipping_weight: skuData.shipping_weight,
        free_shipping: skuData.free_shipping || false,
        meta_title: skuData.meta_title || '',
        meta_description: skuData.meta_description || '',
        slug: skuData.slug || `${skuData.name?.toLowerCase().replace(/\s+/g, '-')}-sku-${Date.now()}`,
        // Campos específicos de SKU
        parent_product_id: skuData.parent_product_id,
        sku_code: skuData.sku_code,
        variant_attributes: skuData.variant_attributes || {},
        sort_order: skuData.sort_order || 0,
        available_variants: skuData.available_variants || {},
        master_slug: skuData.master_slug,
        inherit_from_master: skuData.inherit_from_master || {},
        // Novos campos expandidos
        product_videos: skuData.product_videos || [],
        product_faqs: skuData.product_faqs || [],
        product_highlights: skuData.product_highlights || [],
        reviews_config: skuData.reviews_config || {
          enabled: true,
          show_rating: true,
          show_count: true,
          allow_reviews: true,
          custom_rating: { value: 0, count: 0, use_custom: false }
        },
        trust_indicators: skuData.trust_indicators || [],
        manual_related_products: skuData.manual_related_products || [],
        breadcrumb_config: skuData.breadcrumb_config || {
          custom_path: [],
          use_custom: false,
          show_breadcrumb: true
        },
        product_descriptions: skuData.product_descriptions || {
          short: '',
          detailed: '',
          technical: '',
          marketing: ''
        },
        delivery_config: skuData.delivery_config || {
          custom_shipping_time: '',
          shipping_regions: [],
          express_available: false,
          pickup_locations: []
        },
        display_config: skuData.display_config || {
          show_stock_counter: true,
          show_view_counter: false,
          custom_view_count: 0,
          show_urgency_banner: false,
          urgency_text: '',
          show_social_proof: false,
          social_proof_text: ''
        }
      };

      const result = await addProduct({
        ...sku,
        tagIds: []
      });

      return result.id;
    } catch (error) {
      console.error('Erro ao criar SKU:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [addProduct]);

  // Atualizar SKU
  const updateSKU = useCallback(async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    try {
      setLoading(true);
      return await updateProduct(id, updates);
    } catch (error) {
      console.error('Erro ao atualizar SKU:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [updateProduct]);

  // Deletar SKU
  const deleteSKU = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await deleteProduct(id);
      
      // Retornar true para indicar sucesso
      return true;
    } catch (error) {
      console.error('Erro ao deletar SKU:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [deleteProduct]);

  // Deletar produto mestre e seus SKUs em cascata
  const deleteMasterProductCascade = useCallback(async (masterProductId: string): Promise<{ success: boolean; message: string; deletedSkusCount?: number }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('delete_master_product_cascade', {
        p_master_product_id: masterProductId
      });

      if (error) {
        console.error('Erro ao deletar produto mestre:', error);
        return { success: false, message: 'Erro ao deletar produto mestre' };
      }

      return {
        success: (data as any).success,
        message: (data as any).message,
        deletedSkusCount: (data as any).deleted_skus_count
      };
    } catch (error) {
      console.error('Erro ao deletar produto mestre:', error);
      return { success: false, message: 'Erro interno' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar navegação de SKUs
  const fetchSKUNavigation = useCallback(async (productId: string): Promise<SKUNavigation | null> => {
    try {
      const product = await fetchSingleProduct(productId);
      if (!product) return null;

      // Se é um SKU, buscar o produto mestre
      if (product.product_type === 'sku' && product.parent_product_id) {
        const masterProduct = await fetchSingleProduct(product.parent_product_id);
        if (!masterProduct) return null;

        // Buscar todos os SKUs do produto mestre
        const { data: skusData, error } = await supabase
          .from('view_product_with_tags')
          .select('product_id, product_name, product_price, variant_attributes, sku_code, sort_order')
          .eq('parent_product_id', masterProduct.id)
          .eq('product_type', 'sku')
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao buscar SKUs:', error);
          return null;
        }

        // Agrupar por product_id para evitar duplicatas devido às tags
        const skusMap = new Map<string, any>();
        skusData?.forEach((row: any) => {
          if (!skusMap.has(row.product_id)) {
            skusMap.set(row.product_id, {
              id: row.product_id,
              name: row.product_name || '',
              price: Number(row.product_price) || 0,
              variant_attributes: row.variant_attributes || {},
              sku_code: row.sku_code,
              sort_order: row.sort_order || 0
            });
          }
        });

        const skus = Array.from(skusMap.values());

        // Agrupar SKUs por plataforma para evitar duplicatas
        const platformsMap = new Map<string, any>();
        skus.forEach(sku => {
          const platform = sku.variant_attributes?.platform || '';
          if (platform && !platformsMap.has(platform)) {
            platformsMap.set(platform, {
              platform,
              sku: sku as any,
              available: true
            });
          }
        });

        return {
          masterProduct: masterProduct as any,
          currentSKU: product as any,
          availableSKUs: skus as any,
          platforms: Array.from(platformsMap.values())
        };
      }

      // Se é um produto mestre, buscar seus SKUs
      if (product.product_type === 'master') {
        const { data: skusData, error } = await supabase
          .from('view_product_with_tags')
          .select('product_id, product_name, product_price, variant_attributes, sku_code, sort_order')
          .eq('parent_product_id', product.id)
          .eq('product_type', 'sku')
          .eq('is_active', true);

        if (error) {
          console.error('Erro ao buscar SKUs:', error);
          return null;
        }

        // Agrupar por product_id para evitar duplicatas devido às tags
        const skusMap = new Map<string, any>();
        skusData?.forEach((row: any) => {
          if (!skusMap.has(row.product_id)) {
            skusMap.set(row.product_id, {
              id: row.product_id,
              name: row.product_name || '',
              price: Number(row.product_price) || 0,
              variant_attributes: row.variant_attributes || {},
              sku_code: row.sku_code,
              sort_order: row.sort_order || 0
            });
          }
        });

        const skus = Array.from(skusMap.values());

        // Agrupar SKUs por plataforma para evitar duplicatas
        const platformsMap = new Map<string, any>();
        skus.forEach(sku => {
          const platform = sku.variant_attributes?.platform || '';
          if (platform && !platformsMap.has(platform)) {
            platformsMap.set(platform, {
              platform,
              sku: sku as any,
              available: true
            });
          }
        });

        return {
          masterProduct: product as any,
          currentSKU: undefined,
          availableSKUs: skus as any,
          platforms: Array.from(platformsMap.values())
        };
      }

      return null;
    } catch (error) {
      console.error('Erro ao buscar navegação de SKUs:', error);
      return null;
    }
  }, [fetchSingleProduct]);

  return {
    loading,
    fetchSKUsForMaster,
    createMasterProduct,
    createSKU,
    updateSKU,
    deleteSKU,
    deleteMasterProductCascade,
    fetchSKUNavigation,
    PLATFORM_CONFIG
  };
};

export default useSKUs;
