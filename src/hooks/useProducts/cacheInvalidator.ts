// Cache invalidation utility for product data
export const invalidateAllProductCaches = () => {
  if (typeof window !== 'undefined') {
    console.log('[cacheInvalidator] Clearing all product caches');
    
    // Clear localStorage cache
    localStorage.removeItem('supabase-cache');
    
    // Clear any other potential cache keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('product') || key.includes('cache'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('[cacheInvalidator] Removed cache key:', key);
    });
    
    // Force page reload if needed
    console.log('[cacheInvalidator] All caches cleared');
  }
};

// Debug function to check product loading
export const debugProductLoading = (products: any[], context: string) => {
  console.log(`[${context}] Product loading debug:`, {
    count: products.length,
    first5: products.slice(0, 5).map(p => ({ id: p.id, name: p.name })),
    hasAdminProducts: products.some(p => p.product_type === 'master'),
    productTypes: [...new Set(products.map(p => p.product_type))],
    timestamp: new Date().toISOString()
  });
};