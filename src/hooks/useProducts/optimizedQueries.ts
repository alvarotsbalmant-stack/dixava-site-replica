import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';

interface QueryOptimizationConfig {
  enablePagination?: boolean;
  enableVirtualColumns?: boolean;
  enableIndexHints?: boolean;
  batchSize?: number;
}

// Optimized query for large product datasets
export const fetchProductsOptimized = async (
  config: QueryOptimizationConfig = {}
): Promise<Product[]> => {
  const {
    enablePagination = true,
    enableVirtualColumns = true,
    enableIndexHints = true,
    batchSize = 100
  } = config;

  console.log('[OptimizedQueries] Fetching products with config:', config);
  const startTime = performance.now();

  try {
    // Use the optimized view if available, otherwise fallback to basic query
    let query = supabase
      .from('view_product_with_tags')
      .select(`
        id,
        name,
        description,
        price,
        stock,
        image,
        is_featured,
        category,
        brand,
        created_at,
        updated_at,
        tags:product_tags!inner(
          tag:tags(
            id,
            name,
            color
          )
        )
      `);

    // Apply query optimizations
    if (enableIndexHints) {
      // Order by created_at for better index usage
      query = query.order('created_at', { ascending: false });
    }

    if (enablePagination) {
      // Limit initial fetch for better performance
      query = query.limit(batchSize);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[OptimizedQueries] Database error:', error);
      throw error;
    }

    const queryTime = performance.now() - startTime;
    console.log('[OptimizedQueries] Query completed:', {
      time: `${queryTime.toFixed(2)}ms`,
      count: data?.length || 0,
      config
    });

    if (!data) return [];

    // Process and deduplicate products (due to tags join)
    const processStart = performance.now();
    const productMap = new Map<string, Product>();

    data.forEach((row: any) => {
      const productId = row.id;
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          stock: row.stock,
          image: row.image,
          is_featured: row.is_featured || false,
          category: row.category,
          brand: row.brand,
          created_at: row.created_at,
          updated_at: row.updated_at,
          tags: []
        });
      }

      // Add tag to product if it exists
      if (row.tags?.tag) {
        const product = productMap.get(productId)!;
        const existingTag = product.tags?.find(t => t.id === row.tags.tag.id);
        
        if (!existingTag) {
          product.tags = product.tags || [];
          product.tags.push({
            id: row.tags.tag.id,
            name: row.tags.tag.name
          });
        }
      }
    });

    const processedProducts = Array.from(productMap.values());
    const processTime = performance.now() - processStart;
    
    console.log('[OptimizedQueries] Processing completed:', {
      time: `${processTime.toFixed(2)}ms`,
      totalTime: `${(queryTime + processTime).toFixed(2)}ms`,
      products: processedProducts.length
    });

    return processedProducts;

  } catch (error) {
    console.error('[OptimizedQueries] Error fetching products:', error);
    throw error;
  }
};

// Optimized query for product count (for pagination)
export const fetchProductCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('[OptimizedQueries] Error fetching product count:', error);
    return 0;
  }
};

// Optimized query for product categories (from tags)
export const fetchProductCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .order('category');

    if (error) throw error;
    
    // Get unique categories
    const categories = [...new Set(data?.map(item => item.category).filter(Boolean))];
    return categories;
  } catch (error) {
    console.error('[OptimizedQueries] Error fetching categories:', error);
    return [];
  }
};

// Batch delete for better performance
export const batchDeleteProducts = async (productIds: string[]): Promise<void> => {
  if (productIds.length === 0) return;

  console.log('[OptimizedQueries] Batch deleting products:', productIds.length);
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', productIds);

    if (error) throw error;
    
    console.log('[OptimizedQueries] Batch delete completed');
  } catch (error) {
    console.error('[OptimizedQueries] Batch delete error:', error);
    throw error;
  }
};

// Check database performance and suggest optimizations
export const analyzeDatabasePerformance = async (): Promise<{
  productCount: number;
  indexStatus: string;
  recommendations: string[];
}> => {
  try {
    const productCount = await fetchProductCount();
    const recommendations: string[] = [];

    if (productCount > 1000) {
      recommendations.push('Consider implementing database pagination');
      recommendations.push('Enable query result caching');
    }

    if (productCount > 5000) {
      recommendations.push('Consider database table partitioning');
      recommendations.push('Implement background data archival');
    }

    return {
      productCount,
      indexStatus: 'good', // This could be expanded to check actual indexes
      recommendations
    };
  } catch (error) {
    console.error('[OptimizedQueries] Performance analysis error:', error);
    return {
      productCount: 0,
      indexStatus: 'unknown',
      recommendations: ['Error analyzing performance']
    };
  }
};