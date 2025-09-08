import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';
import { CarouselConfig } from '@/types/specialSections';
import { handleSupabaseRetry, invalidateSupabaseCache, startErrorMonitoring } from '@/utils/supabaseErrorHandler';

const mapRowToProduct = (row: any): Product => ({
  id: row.product_id,
  name: row.product_name || '',
  brand: row.brand || '',
  category: row.category || '',
  description: row.product_description || '',
  price: Number(row.product_price) || 0,
  pro_price: row.pro_price ? Number(row.pro_price) : undefined,
  list_price: row.list_price ? Number(row.list_price) : undefined,
  image: row.product_image || '',
  additional_images: row.additional_images || [],
  sizes: row.sizes || [],
  colors: row.colors || [],
  stock: row.product_stock || 0,
  badge_text: row.badge_text || '',
  badge_color: row.badge_color || '#22c55e',
  badge_visible: row.badge_visible || false,
  specifications: row.specifications || [],
  technical_specs: row.technical_specs || {},
  product_features: row.product_features || {},
  shipping_weight: row.shipping_weight ? Number(row.shipping_weight) : undefined,
  free_shipping: row.free_shipping || false,
  meta_title: row.meta_title || '',
  meta_description: row.meta_description || '',
  slug: row.slug || '',
  is_active: row.is_active !== false,
  is_featured: row.is_featured || false,
  
  // Campos UTI PRO
  uti_pro_enabled: row.uti_pro_enabled || false,
  uti_pro_value: row.uti_pro_value ? Number(row.uti_pro_value) : undefined,
  uti_pro_custom_price: row.uti_pro_custom_price ? Number(row.uti_pro_custom_price) : undefined,
  uti_pro_type: row.uti_pro_type || 'percentage',

  // Campos UTI Coins
  uti_coins_cashback_percentage: row.uti_coins_cashback_percentage ? Number(row.uti_coins_cashback_percentage) : undefined,
  uti_coins_discount_percentage: row.uti_coins_discount_percentage ? Number(row.uti_coins_discount_percentage) : undefined,

  
  // Campos do sistema de SKUs
  parent_product_id: row.parent_product_id || undefined,
  is_master_product: row.is_master_product || false,
  product_type: row.product_type || 'simple',
  sku_code: row.sku_code || undefined,
  variant_attributes: row.variant_attributes || {},
  sort_order: row.sort_order || 0,
  available_variants: row.available_variants || {},
  master_slug: row.master_slug || undefined,
  inherit_from_master: row.inherit_from_master || {},
  
  // Novos campos expandidos
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
    pickup_locations: [],
    shipping_notes: ''
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
  

  
  tags: [],
  created_at: row.created_at || new Date().toISOString(),
  updated_at: row.updated_at || new Date().toISOString()
});

export const fetchProductsFromDatabase = async (includeAdmin: boolean = false): Promise<Product[]> => {
  // Iniciar monitoramento de erros na primeira chamada
  if (typeof window !== 'undefined' && !(window as any).__errorMonitoringStarted) {
    startErrorMonitoring();
    (window as any).__errorMonitoringStarted = true;
  }

  return handleSupabaseRetry(async () => {
    console.log(`[fetchProductsFromDatabase] 🔧 VERSÃO CORRIGIDA - Fetching ALL products (includeAdmin: ${includeAdmin})`);
    
    try {
      // ESTRATÉGIA 1: Query direta na tabela products com LEFT JOIN para tags
      console.log('[fetchProductsFromDatabase] Tentativa 1: Query direta com LEFT JOIN');
      
      let query = supabase
        .from('products')
        .select(`
          *,
          product_tags!left(
            tag_id,
            tags!left(
              id,
              name
            )
          )
        `);
      
      // Aplicar filtros apenas se necessário
      if (!includeAdmin) {
        query = query.neq('product_type', 'master').eq('is_active', true);
      }

      const { data: productsWithTags, error: joinError } = await query;

      if (joinError) {
        console.warn('[fetchProductsFromDatabase] LEFT JOIN falhou, tentando estratégia 2:', joinError.message);
        throw joinError;
      }

      if (productsWithTags && productsWithTags.length > 0) {
        console.log(`[fetchProductsFromDatabase] ✅ LEFT JOIN bem-sucedido: ${productsWithTags.length} registros`);
        
        // Processar dados com tags do LEFT JOIN
        const productsMap = new Map<string, Product>();
        let processedCount = 0;
        let skippedCount = 0;
        
        productsWithTags.forEach((row: any) => {
          const productId = row.id;
          
          if (!productId) {
            console.warn('[fetchProductsFromDatabase] ⚠️ Produto sem ID ignorado:', row);
            skippedCount++;
            return;
          }
          
          if (!productsMap.has(productId)) {
            productsMap.set(productId, mapRowToProduct({
              product_id: row.id,
              product_name: row.name,
              product_description: row.description,
              product_price: row.price,
              product_image: row.image,
              product_stock: row.stock,
              ...row
            }));
            processedCount++;
          }
          
          // Adicionar tags do LEFT JOIN se existirem
          if (row.product_tags && Array.isArray(row.product_tags)) {
            const product = productsMap.get(productId)!;
            
            row.product_tags.forEach((pt: any) => {
              if (pt && pt.tags && pt.tags.id && pt.tags.name) {
                const tagExists = product.tags?.some(tag => tag.id === pt.tags.id);
                if (!tagExists) {
                  product.tags = product.tags || [];
                  product.tags.push({
                    id: pt.tags.id,
                    name: pt.tags.name
                  });
                }
              }
            });
          }
        });
        
        const finalProducts = Array.from(productsMap.values());
        console.log(`[fetchProductsFromDatabase] ✅ Processamento concluído:`);
        console.log(`  - Registros processados: ${processedCount}`);
        console.log(`  - Registros ignorados: ${skippedCount}`);
        console.log(`  - Produtos únicos finais: ${finalProducts.length}`);
        
        return finalProducts;
      }
    } catch (joinError) {
      console.warn('[fetchProductsFromDatabase] Estratégia 1 falhou, tentando estratégia 2');
    }

    try {
      // ESTRATÉGIA 2: Buscar produtos e tags separadamente
      console.log('[fetchProductsFromDatabase] Tentativa 2: Queries separadas');
      
      // Buscar todos os produtos
      let productsQuery = supabase
        .from('products')
        .select('*');
      
      if (!includeAdmin) {
        productsQuery = productsQuery.neq('product_type', 'master').eq('is_active', true);
      }
      
      const { data: products, error: productsError } = await productsQuery;
      
      if (productsError) {
        console.error('[fetchProductsFromDatabase] Erro ao buscar produtos:', productsError);
        throw productsError;
      }
      
      if (!products || products.length === 0) {
        console.warn('[fetchProductsFromDatabase] Nenhum produto encontrado');
        return [];
      }
      
      console.log(`[fetchProductsFromDatabase] ✅ Produtos encontrados: ${products.length}`);
      
      // Buscar todas as relações produto-tag
      const { data: productTags, error: tagsError } = await supabase
        .from('product_tags')
        .select(`
          product_id,
          tag_id,
          tags!inner(
            id,
            name
          )
        `);
      
      if (tagsError) {
        console.warn('[fetchProductsFromDatabase] Erro ao buscar tags (continuando sem tags):', tagsError);
      }
      
      // Criar mapa de produtos
      const productsMap = new Map<string, Product>();
      let processedCount = 0;
      let skippedCount = 0;
      
      products.forEach((row: any) => {
        const productId = row.id;
        
        if (!productId) {
          console.warn('[fetchProductsFromDatabase] ⚠️ Produto sem ID ignorado:', row);
          skippedCount++;
          return;
        }
        
        productsMap.set(productId, mapRowToProduct({
          product_id: row.id,
          product_name: row.name,
          product_description: row.description,
          product_price: row.price,
          product_image: row.image,
          product_stock: row.stock,
          ...row
        }));
        processedCount++;
      });
      
      // Adicionar tags aos produtos
      if (productTags && productTags.length > 0) {
        console.log(`[fetchProductsFromDatabase] Adicionando ${productTags.length} relações de tags`);
        
        productTags.forEach((pt: any) => {
          if (pt.product_id && pt.tags && productsMap.has(pt.product_id)) {
            const product = productsMap.get(pt.product_id)!;
            const tagExists = product.tags?.some(tag => tag.id === pt.tags.id);
            
            if (!tagExists) {
              product.tags = product.tags || [];
              product.tags.push({
                id: pt.tags.id,
                name: pt.tags.name
              });
            }
          }
        });
      }
      
      const finalProducts = Array.from(productsMap.values());
      console.log(`[fetchProductsFromDatabase] ✅ Estratégia 2 concluída:`);
      console.log(`  - Produtos processados: ${processedCount}`);
      console.log(`  - Produtos ignorados: ${skippedCount}`);
      console.log(`  - Produtos únicos finais: ${finalProducts.length}`);
      
      return finalProducts;
      
    } catch (separateError) {
      console.error('[fetchProductsFromDatabase] Estratégia 2 também falhou:', separateError);
    }

    // ESTRATÉGIA 3: Fallback para produtos sem tags
    console.log('[fetchProductsFromDatabase] Tentativa 3: Fallback simples (apenas produtos)');
    
    try {
      let fallbackQuery = supabase
        .from('products')
        .select('*');
      
      if (!includeAdmin) {
        fallbackQuery = fallbackQuery.neq('product_type', 'master').eq('is_active', true);
      }
      
      const { data: fallbackProducts, error: fallbackError } = await fallbackQuery;
      
      if (fallbackError) {
        throw fallbackError;
      }
      
      if (!fallbackProducts) {
        return [];
      }
      
      const finalProducts = fallbackProducts
        .filter(row => row.id) // Garantir que tem ID
        .map(row => mapRowToProduct({
          product_id: row.id,
          product_name: row.name,
          product_description: row.description,
          product_price: row.price,
          product_image: row.image,
          product_stock: row.stock,
          ...row
        }));
      
      console.log(`[fetchProductsFromDatabase] ✅ Fallback concluído: ${finalProducts.length} produtos (sem tags)`);
      return finalProducts;
      
    } catch (fallbackError) {
      console.error('[fetchProductsFromDatabase] ❌ Todas as estratégias falharam:', fallbackError);
      throw fallbackError;
    }
  }, 'fetchProductsFromDatabase', 3);
};

export const fetchProductsByCriteria = async (config: CarouselConfig, includeAdmin: boolean = false): Promise<Product[]> => {
  try {
    let query = supabase.from('view_product_with_tags')
      .select('*');
    
    // Só filtrar produtos master se não for para admin
    if (!includeAdmin) {
      query = query.neq('product_type', 'master');
    }
    
    // Filter by product IDs if specified
    if (config.product_ids && config.product_ids.length > 0) {
      query = query.in('product_id', config.product_ids);
    }
    
    // Filter by tag IDs if specified
    if (config.tag_ids && config.tag_ids.length > 0) {
      query = query.in('tag_id', config.tag_ids);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products by criteria:', error);
      throw error;
    }

    // Group products by ID to avoid duplicates due to tags
    const productsMap = new Map<string, Product>();
    
    data?.forEach((row: any) => {
      const productId = row.product_id;
      
      if (!productsMap.has(productId)) {
        productsMap.set(productId, mapRowToProduct(row));
      }
      
      // Add tag if exists and not duplicate
      if (row.tag_id && row.tag_name) {
        const product = productsMap.get(productId)!;
        const tagExists = product.tags?.some(tag => tag.id === row.tag_id);
        
        if (!tagExists) {
          product.tags = product.tags || [];
          product.tags.push({
            id: row.tag_id,
            name: row.tag_name
          });
        }
      }
    });

    console.log(`[fetchProductsByCriteria] Carregados ${productsMap.size} produtos únicos por critério`);
    return Array.from(productsMap.values());
  } catch (error) {
    console.error('Error in fetchProductsByCriteria:', error);
    throw error;
  }
};

export const fetchSingleProductFromDatabase = async (id: string): Promise<Product | null> => {
  try {
    // Primeiro tentar buscar na view (para produtos normais)
    let { data, error } = await supabase
      .from('view_product_with_tags')
      .select('*')
      .eq('product_id', id);

    // Se não encontrar na view, buscar diretamente na tabela products (para produtos SKUs)
    if (!data || data.length === 0) {
      const { data: directData, error: directError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (directError) {
        console.error('Error fetching single product from products table:', directError);
        return null;
      }

      if (!directData) {
        return null;
      }

      // Mapear dados diretos da tabela products
      const product = mapRowToProduct({
        product_id: directData.id,
        product_name: directData.name,
        brand: directData.brand,
        category: directData.category,
        product_description: directData.description,
        product_price: directData.price,
        pro_price: directData.pro_price,
        list_price: directData.list_price,
        product_image: directData.image,
        additional_images: directData.additional_images,
        sizes: directData.sizes,
        colors: directData.colors,
        product_stock: directData.stock,
        badge_text: directData.badge_text,
        badge_color: directData.badge_color,
        badge_visible: directData.badge_visible,
        specifications: directData.specifications,
        technical_specs: directData.technical_specs,
        product_features: directData.product_features,
        shipping_weight: directData.shipping_weight,
        free_shipping: directData.free_shipping,
        meta_title: directData.meta_title,
        meta_description: directData.meta_description,
        slug: directData.slug,
        is_active: directData.is_active,
        is_featured: directData.is_featured,
        
        // Campos UTI PRO
        uti_pro_enabled: directData.uti_pro_enabled,
        uti_pro_value: directData.uti_pro_value,
        uti_pro_custom_price: directData.uti_pro_custom_price,
        uti_pro_type: directData.uti_pro_type,
        
        parent_product_id: directData.parent_product_id,
        is_master_product: directData.is_master_product,
        product_type: directData.product_type,
        sku_code: directData.sku_code,
        variant_attributes: directData.variant_attributes,
        sort_order: directData.sort_order,
        available_variants: directData.available_variants,
        master_slug: directData.master_slug,
        inherit_from_master: directData.inherit_from_master,
        product_videos: directData.product_videos,
        product_faqs: directData.product_faqs,
        product_highlights: directData.product_highlights,
        reviews_config: directData.reviews_config,
        trust_indicators: directData.trust_indicators,
        manual_related_products: directData.manual_related_products,
        breadcrumb_config: directData.breadcrumb_config,
        product_descriptions: directData.product_descriptions,
        delivery_config: directData.delivery_config,
        display_config: directData.display_config,
        
        // UTI Coins Cashback
        uti_coins_cashback_percentage: directData.uti_coins_cashback_percentage,
        
        // UTI Coins Desconto
        uti_coins_discount_percentage: directData.uti_coins_discount_percentage,
        
        created_at: directData.created_at,
        updated_at: directData.updated_at
      });

      return product;
    }

    if (error) {
      console.error('Error fetching single product:', error);
      throw error;
    }

    // Use the first row to create the product
    const product = mapRowToProduct(data[0]);
    
    // Add all tags for this product
    data.forEach((row: any) => {
      if (row.tag_id && row.tag_name) {
        const tagExists = product.tags?.some(tag => tag.id === row.tag_id);
        
        if (!tagExists) {
          product.tags = product.tags || [];
          product.tags.push({
            id: row.tag_id,
            name: row.tag_name
          });
        }
      }
    });

    return product;
  } catch (error) {
    console.error('Error in fetchSingleProductFromDatabase:', error);
    throw error;
  }
};

export const addProductToDatabase = async (productData: Omit<Product, 'id' | 'tags'> & { tagIds: string[] }) => {
  try {
    const { tagIds, ...productInfo } = productData;
    
    // Preparar dados do produto incluindo todos os novos campos
    const productToInsert = {
      ...productInfo,
      // Garantir que os novos campos JSONB sejam sempre incluídos
      product_videos: productInfo.product_videos || [],
      product_faqs: productInfo.product_faqs || [],
      product_highlights: productInfo.product_highlights || [],
      reviews_config: productInfo.reviews_config || {
        enabled: true,
        show_rating: true,
        show_count: true,
        allow_reviews: true,
        custom_rating: { value: 0, count: 0, use_custom: false }
      },
      trust_indicators: productInfo.trust_indicators || [],
      manual_related_products: productInfo.manual_related_products || [],
      breadcrumb_config: productInfo.breadcrumb_config || {
        custom_path: [],
        use_custom: false,
        show_breadcrumb: true
      },
      product_descriptions: productInfo.product_descriptions || {
        short: '',
        detailed: '',
        technical: '',
        marketing: ''
      },
      delivery_config: productInfo.delivery_config || {
        custom_shipping_time: '',
        shipping_regions: [],
        express_available: false,
        pickup_locations: [],
        shipping_notes: ''
      },
      display_config: productInfo.display_config || {
        show_stock_counter: true,
        show_view_counter: false,
        custom_view_count: 0,
        show_urgency_banner: false,
        urgency_text: '',
        show_social_proof: false,
        social_proof_text: ''
      },

    };
    
    console.log('[addProductToDatabase] Dados sendo enviados:', productToInsert);
    console.log('[addProductToDatabase] UTI Coins Cashback:', productToInsert.uti_coins_cashback_percentage);
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([productToInsert])
      .select()
      .single();

    if (productError) {
      console.error('[addProductToDatabase] Erro ao inserir produto:', productError);
      throw productError;
    }

    // Adicionar tags se fornecidas
    if (tagIds && tagIds.length > 0) {
      const tagInserts = tagIds.map(tagId => ({
        product_id: product.id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from('product_tags')
        .insert(tagInserts);

      if (tagError) throw tagError;
    }

    console.log('[addProductToDatabase] Produto criado com sucesso:', product);
    return mapRowToProduct(product);
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProductInDatabase = async (id: string, updates: Partial<Product> & { tagIds?: string[] }) => {
  try {
    const { tagIds, tags, ...productUpdates } = updates;
    
    // Preparar dados de atualização incluindo todos os novos campos
    const updateData = {
      ...productUpdates,
      // Garantir que os novos campos JSONB sejam sempre incluídos
      product_videos: productUpdates.product_videos || [],
      product_faqs: productUpdates.product_faqs || [],
      product_highlights: productUpdates.product_highlights || [],
      reviews_config: productUpdates.reviews_config || {
        enabled: true,
        show_rating: true,
        show_count: true,
        allow_reviews: true,
        custom_rating: { value: 0, count: 0, use_custom: false }
      },
      trust_indicators: productUpdates.trust_indicators || [],
      manual_related_products: productUpdates.manual_related_products || [],
      breadcrumb_config: productUpdates.breadcrumb_config || {
        custom_path: [],
        use_custom: false,
        show_breadcrumb: true
      },
      product_descriptions: productUpdates.product_descriptions || {
        short: '',
        detailed: '',
        technical: '',
        marketing: ''
      },
      delivery_config: productUpdates.delivery_config || {
        custom_shipping_time: '',
        shipping_regions: [],
        express_available: false,
        pickup_locations: [],
        shipping_notes: ''
      },
      display_config: productUpdates.display_config || {
        show_stock_counter: true,
        show_view_counter: false,
        custom_view_count: 0,
        show_urgency_banner: false,
        urgency_text: '',
        show_social_proof: false,
        social_proof_text: ''
      },

    };
    
    console.log('[updateProductInDatabase] Dados sendo enviados:', updateData);
    console.log('[updateProductInDatabase] UTI Coins Cashback:', updateData.uti_coins_cashback_percentage);
    console.log('[updateProductInDatabase] Tipo do cashback:', typeof updateData.uti_coins_cashback_percentage);
    console.log('[updateProductInDatabase] Produto ID:', id);
    
    // Atualizar produto
    const { data: updatedProduct, error: productError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (productError) {
      console.error('[updateProductInDatabase] Erro ao atualizar produto:', productError);
      throw productError;
    }

    // Atualizar tags se fornecidas
    if (tagIds !== undefined) {
      // Remover tags existentes
      const { error: deleteError } = await supabase
        .from('product_tags')
        .delete()
        .eq('product_id', id);

      if (deleteError) throw deleteError;

      // Adicionar novas tags
      if (tagIds.length > 0) {
        const tagInserts = tagIds.map(tagId => ({
          product_id: id,
          tag_id: tagId
        }));

        const { error: insertError } = await supabase
          .from('product_tags')
          .insert(tagInserts);

        if (insertError) throw insertError;
      }
    }

    console.log('[updateProductInDatabase] Produto atualizado com sucesso:', updatedProduct);
    console.log('[updateProductInDatabase] Cashback salvo no banco:', updatedProduct?.uti_coins_cashback_percentage);
    console.log('[updateProductInDatabase] Produto completo retornado:', JSON.stringify(updatedProduct, null, 2));
    return mapRowToProduct(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProductFromDatabase = async (id: string) => {
  try {
    // Primeiro, remover as associações de tags
    const { error: tagError } = await supabase
      .from('product_tags')
      .delete()
      .eq('product_id', id);

    if (tagError) throw tagError;

    // Depois, remover o produto
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (productError) throw productError;

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};






