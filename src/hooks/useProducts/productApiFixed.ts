import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';
import { CarouselConfig } from '@/types/specialSections';
import { handleSupabaseRetry, invalidateSupabaseCache, startErrorMonitoring } from '@/utils/supabaseErrorHandler';

const mapRowToProduct = (row: any): Product => ({
  id: row.id || row.product_id,
  name: row.name || row.product_name || '',
  brand: row.brand || '',
  category: row.category || '',
  description: row.description || row.product_description || '',
  price: Number(row.price || row.product_price) || 0,
  pro_price: row.pro_price ? Number(row.pro_price) : undefined,
  list_price: row.list_price ? Number(row.list_price) : undefined,
  image: row.image || row.product_image || '',
  additional_images: row.additional_images || [],
  sizes: row.sizes || [],
  colors: row.colors || [],
  stock: row.stock || row.product_stock || 0,
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

// FUNÇÃO CORRIGIDA: Busca produtos diretamente da tabela products com LEFT JOIN para tags
export const fetchProductsFromDatabaseFixed = async (includeAdmin: boolean = false): Promise<Product[]> => {
  // Iniciar monitoramento de erros na primeira chamada
  if (typeof window !== 'undefined' && !(window as any).__errorMonitoringStarted) {
    startErrorMonitoring();
    (window as any).__errorMonitoringStarted = true;
  }

  return handleSupabaseRetry(async () => {
    console.log(`[fetchProductsFromDatabaseFixed] 🔧 USANDO VERSÃO CORRIGIDA - Fetching ALL products (includeAdmin: ${includeAdmin})`);
    
    try {
      // ESTRATÉGIA 1: Query direta na tabela products com LEFT JOIN para tags
      console.log('[fetchProductsFromDatabaseFixed] Tentativa 1: Query direta com LEFT JOIN');
      
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
        query = query.neq('product_type', 'master');
      }
      
      // Garantir que apenas produtos ativos sejam incluídos (a menos que seja admin)
      if (!includeAdmin) {
        query = query.eq('is_active', true);
      }

      const { data: productsWithTags, error: joinError } = await query;

      if (joinError) {
        console.warn('[fetchProductsFromDatabaseFixed] LEFT JOIN falhou, tentando estratégia 2:', joinError.message);
        throw joinError;
      }

      if (productsWithTags && productsWithTags.length > 0) {
        console.log(`[fetchProductsFromDatabaseFixed] ✅ LEFT JOIN bem-sucedido: ${productsWithTags.length} registros`);
        
        // Processar dados com tags do LEFT JOIN
        const productsMap = new Map<string, Product>();
        let processedCount = 0;
        let skippedCount = 0;
        
        productsWithTags.forEach((row: any) => {
          const productId = row.id;
          
          if (!productId) {
            console.warn('[fetchProductsFromDatabaseFixed] ⚠️ Produto sem ID ignorado:', row);
            skippedCount++;
            return;
          }
          
          if (!productsMap.has(productId)) {
            productsMap.set(productId, mapRowToProduct(row));
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
        console.log(`[fetchProductsFromDatabaseFixed] ✅ Processamento concluído:`);
        console.log(`  - Registros processados: ${processedCount}`);
        console.log(`  - Registros ignorados: ${skippedCount}`);
        console.log(`  - Produtos únicos finais: ${finalProducts.length}`);
        
        return finalProducts;
      }
    } catch (joinError) {
      console.warn('[fetchProductsFromDatabaseFixed] Estratégia 1 falhou, tentando estratégia 2');
    }

    try {
      // ESTRATÉGIA 2: Buscar produtos e tags separadamente
      console.log('[fetchProductsFromDatabaseFixed] Tentativa 2: Queries separadas');
      
      // Buscar todos os produtos
      let productsQuery = supabase
        .from('products')
        .select('*');
      
      if (!includeAdmin) {
        productsQuery = productsQuery.neq('product_type', 'master').eq('is_active', true);
      }
      
      const { data: products, error: productsError } = await productsQuery;
      
      if (productsError) {
        console.error('[fetchProductsFromDatabaseFixed] Erro ao buscar produtos:', productsError);
        throw productsError;
      }
      
      if (!products || products.length === 0) {
        console.warn('[fetchProductsFromDatabaseFixed] Nenhum produto encontrado');
        return [];
      }
      
      console.log(`[fetchProductsFromDatabaseFixed] ✅ Produtos encontrados: ${products.length}`);
      
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
        console.warn('[fetchProductsFromDatabaseFixed] Erro ao buscar tags (continuando sem tags):', tagsError);
      }
      
      // Criar mapa de produtos
      const productsMap = new Map<string, Product>();
      let processedCount = 0;
      let skippedCount = 0;
      
      products.forEach((row: any) => {
        const productId = row.id;
        
        if (!productId) {
          console.warn('[fetchProductsFromDatabaseFixed] ⚠️ Produto sem ID ignorado:', row);
          skippedCount++;
          return;
        }
        
        productsMap.set(productId, mapRowToProduct(row));
        processedCount++;
      });
      
      // Adicionar tags aos produtos
      if (productTags && productTags.length > 0) {
        console.log(`[fetchProductsFromDatabaseFixed] Adicionando ${productTags.length} relações de tags`);
        
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
      console.log(`[fetchProductsFromDatabaseFixed] ✅ Estratégia 2 concluída:`);
      console.log(`  - Produtos processados: ${processedCount}`);
      console.log(`  - Produtos ignorados: ${skippedCount}`);
      console.log(`  - Produtos únicos finais: ${finalProducts.length}`);
      
      return finalProducts;
      
    } catch (separateError) {
      console.error('[fetchProductsFromDatabaseFixed] Estratégia 2 também falhou:', separateError);
    }

    // ESTRATÉGIA 3: Fallback para produtos sem tags
    console.log('[fetchProductsFromDatabaseFixed] Tentativa 3: Fallback simples (apenas produtos)');
    
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
        .map(row => mapRowToProduct(row));
      
      console.log(`[fetchProductsFromDatabaseFixed] ✅ Fallback concluído: ${finalProducts.length} produtos (sem tags)`);
      return finalProducts;
      
    } catch (fallbackError) {
      console.error('[fetchProductsFromDatabaseFixed] ❌ Todas as estratégias falharam:', fallbackError);
      throw fallbackError;
    }
  }, 'fetchProductsFromDatabaseFixed', 3);
};

// FUNÇÃO CORRIGIDA: Backup usando a nova estratégia
export const fetchAllProductsForBackupFixed = async (): Promise<Product[]> => {
  console.log('[fetchAllProductsForBackupFixed] 🔧 USANDO VERSÃO CORRIGIDA PARA BACKUP');
  
  // Usar a função corrigida com includeAdmin = true para pegar TODOS os produtos
  const products = await fetchProductsFromDatabaseFixed(true);
  
  console.log(`[fetchAllProductsForBackupFixed] ✅ Backup concluído: ${products.length} produtos`);
  return products;
};

// Função para buscar produtos por critério (mantém compatibilidade)
export const fetchProductsByCriteriaFixed = async (config: CarouselConfig, includeAdmin: boolean = false): Promise<Product[]> => {
  try {
    console.log('[fetchProductsByCriteriaFixed] 🔧 USANDO VERSÃO CORRIGIDA PARA CRITÉRIOS');
    
    let query = supabase.from('products')
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
    
    // Só filtrar produtos master se não for para admin
    if (!includeAdmin) {
      query = query.neq('product_type', 'master').eq('is_active', true);
    }
    
    // Filter by product IDs if specified
    if (config.product_ids && config.product_ids.length > 0) {
      query = query.in('id', config.product_ids);
    }
    
    // Filter by tag IDs if specified (precisa de abordagem diferente)
    if (config.tag_ids && config.tag_ids.length > 0) {
      // Para filtrar por tags, precisamos usar uma subquery ou fazer em duas etapas
      const { data: productIdsWithTags } = await supabase
        .from('product_tags')
        .select('product_id')
        .in('tag_id', config.tag_ids);
      
      if (productIdsWithTags && productIdsWithTags.length > 0) {
        const productIds = productIdsWithTags.map(pt => pt.product_id);
        query = query.in('id', productIds);
      } else {
        // Se não há produtos com essas tags, retornar vazio
        return [];
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products by criteria:', error);
      throw error;
    }

    // Processar produtos com tags
    const productsMap = new Map<string, Product>();
    
    data?.forEach((row: any) => {
      const productId = row.id;
      
      if (!productId) return;
      
      if (!productsMap.has(productId)) {
        productsMap.set(productId, mapRowToProduct(row));
      }
      
      // Adicionar tags do LEFT JOIN
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
    console.log(`[fetchProductsByCriteriaFixed] ✅ Carregados ${finalProducts.length} produtos únicos por critério`);
    return finalProducts;
  } catch (error) {
    console.error('Error in fetchProductsByCriteriaFixed:', error);
    throw error;
  }
};

// Função para buscar produto único (mantém compatibilidade)
export const fetchSingleProductFromDatabaseFixed = async (id: string): Promise<Product | null> => {
  try {
    console.log(`[fetchSingleProductFromDatabaseFixed] 🔧 Buscando produto ${id} com versão corrigida`);
    
    // Tentar buscar com tags primeiro
    const { data, error } = await supabase
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
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching single product:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const product = mapRowToProduct(data);
    
    // Adicionar tags se existirem
    if (data.product_tags && Array.isArray(data.product_tags)) {
      data.product_tags.forEach((pt: any) => {
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

    console.log(`[fetchSingleProductFromDatabaseFixed] ✅ Produto encontrado: ${product.name}`);
    return product;
  } catch (error) {
    console.error('Error in fetchSingleProductFromDatabaseFixed:', error);
    return null;
  }
};

// Exportar as funções originais também para compatibilidade
export {
  fetchProductsFromDatabaseFixed as fetchProductsFromDatabase,
  fetchAllProductsForBackupFixed as fetchAllProductsForBackup,
  fetchProductsByCriteriaFixed as fetchProductsByCriteria,
  fetchSingleProductFromDatabaseFixed as fetchSingleProductFromDatabase
};

// Função de diagnóstico para comparar resultados
export const diagnoseProductDiscrepancy = async () => {
  console.log('🔍 DIAGNÓSTICO DE DISCREPÂNCIA DE PRODUTOS');
  
  try {
    // Contar produtos na tabela diretamente
    const { count: totalProducts, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Erro ao contar produtos:', countError);
    } else {
      console.log(`📊 Total de produtos na tabela: ${totalProducts}`);
    }
    
    // Contar produtos ativos
    const { count: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (activeError) {
      console.error('Erro ao contar produtos ativos:', activeError);
    } else {
      console.log(`📊 Produtos ativos: ${activeProducts}`);
    }
    
    // Contar produtos não-master
    const { count: nonMasterProducts, error: nonMasterError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .neq('product_type', 'master')
      .eq('is_active', true);
    
    if (nonMasterError) {
      console.error('Erro ao contar produtos não-master:', nonMasterError);
    } else {
      console.log(`📊 Produtos não-master ativos: ${nonMasterProducts}`);
    }
    
    // Testar a função corrigida
    const fixedResults = await fetchProductsFromDatabaseFixed(true);
    console.log(`📊 Função corrigida (includeAdmin=true): ${fixedResults.length} produtos`);
    
    const fixedResultsNoAdmin = await fetchProductsFromDatabaseFixed(false);
    console.log(`📊 Função corrigida (includeAdmin=false): ${fixedResultsNoAdmin.length} produtos`);
    
    // Testar backup corrigido
    const backupResults = await fetchAllProductsForBackupFixed();
    console.log(`📊 Backup corrigido: ${backupResults.length} produtos`);
    
    return {
      totalProducts,
      activeProducts,
      nonMasterProducts,
      fixedResultsAdmin: fixedResults.length,
      fixedResultsNoAdmin: fixedResultsNoAdmin.length,
      backupResults: backupResults.length
    };
    
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
    throw error;
  }
};

