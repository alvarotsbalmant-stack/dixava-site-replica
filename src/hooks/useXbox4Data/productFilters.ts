
import { Product } from '@/hooks/useProducts';
import { ProductOverride, SectionConfig } from './types';

export const getProductsForSection = (allProducts: Product[], config: SectionConfig): Product[] => {
  if (!config) return [];

  // If há produtos específicos configurados
  if (config.products && config.products.length > 0) {
    return config.products
      .map((specificProduct: ProductOverride) => {
        const baseProduct = allProducts.find(p => p.id === specificProduct.productId);
        if (!baseProduct) return null;
        
        // Aplicar overrides se fornecidos
        return {
          ...baseProduct,
          name: specificProduct.title || baseProduct.name,
          image: specificProduct.imageUrl || baseProduct.image,
          badge_text: specificProduct.badge?.text || baseProduct.badge_text,
          badge_color: specificProduct.badge?.color || baseProduct.badge_color,
          // Adicionar propriedades para ofertas - use is_featured instead of isOnSale/isFeatured
          is_featured: specificProduct.isFeatured || specificProduct.isOnSale || baseProduct.is_featured,
          originalPrice: specificProduct.originalPrice || undefined,
          discount: specificProduct.discount || undefined
        };
      })
      .filter(Boolean);
  }

  // Fallback: filtrar por tags
  const { tagIds, limit = 10 } = config.filter || {};
  
  let filtered = allProducts;
  
  if (tagIds && tagIds.length > 0) {
    filtered = filtered.filter(product => 
      product.tags?.some(tag => 
        tagIds.includes(tag.id) || tagIds.includes(tag.name.toLowerCase())
      )
    );
  }
  
  return filtered.slice(0, limit);
};

export const processProductsFromRows = (allProducts: any[]): Product[] => {
  const productsMap = new Map<string, Product>();
  
  allProducts?.forEach((row: any) => {
    const productId = row.product_id;
    
    if (!productsMap.has(productId)) {
      productsMap.set(productId, {
        id: productId,
        name: row.product_name || '',
        description: row.product_description || '',
        price: Number(row.product_price) || 0,
        image: row.product_image || '',
        stock: row.product_stock || 0,
        badge_text: row.badge_text || '',
        badge_color: row.badge_color || '#22c55e',
        badge_visible: row.badge_visible || false,
        specifications: row.product_specifications || [],
        images: row.product_images || [],
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        is_featured: false
      });
    }
    
    // Adicionar tag se existir
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

  return Array.from(productsMap.values());
};
