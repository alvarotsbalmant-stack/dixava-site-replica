import { useState, useMemo, useCallback } from 'react';
import { useProducts, Product } from './useProducts';
import { useDebounce } from './useDebounce';

interface ProductFilters {
  search: string;
  tagId: string;
}

interface UsePaginatedProductsResult {
  products: Product[];
  totalProducts: number;
  displayedProducts: number;
  loading: boolean;
  showLoadAll: boolean;
  isShowingAll: boolean;
  filters: ProductFilters;
  hasActiveFilters: boolean;
  setSearch: (search: string) => void;
  setTagFilter: (tagId: string) => void;
  loadAllProducts: () => void;
  clearFilters: () => void;
  addProduct: (productData: any) => Promise<Product | null>;
  updateProduct: (id: string, updates: any) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<void>;
}

const INITIAL_PAGE_SIZE = 50;

export function useProductsPaginated(): UsePaginatedProductsResult {
  const { products: allProducts, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [tagId, setTagFilter] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Debounce search to avoid excessive filtering
  const debouncedSearch = useDebounce(search, 300);

  const filters = useMemo(() => ({
    search: debouncedSearch,
    tagId
  }), [debouncedSearch, tagId]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.search || filters.tagId);
  }, [filters]);

  // Filter products based on search and tag
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.tagId) {
      filtered = filtered.filter(product => 
        product.tags?.some(tag => tag.id === filters.tagId)
      );
    }

    return filtered;
  }, [allProducts, filters]);

  // Smart pagination logic
  const displayedProducts = useMemo(() => {
    // If there are active filters, show all matching results
    if (hasActiveFilters) {
      return filteredProducts;
    }

    // If no filters and user hasn't clicked "Load All", show first 50
    if (!showAll) {
      return filteredProducts.slice(0, INITIAL_PAGE_SIZE);
    }

    // Show all products
    return filteredProducts;
  }, [filteredProducts, hasActiveFilters, showAll]);

  const showLoadAll = useMemo(() => {
    return !hasActiveFilters && !showAll && filteredProducts.length > INITIAL_PAGE_SIZE;
  }, [hasActiveFilters, showAll, filteredProducts.length]);

  const loadAllProducts = useCallback(() => {
    setShowAll(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setTagFilter('');
    setShowAll(false);
  }, []);

  const handleSetSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    // Reset pagination when searching
    setShowAll(false);
  }, []);

  const handleSetTagFilter = useCallback((newTagId: string) => {
    setTagFilter(newTagId);
    // Reset pagination when filtering
    setShowAll(false);
  }, []);

  return {
    products: displayedProducts,
    totalProducts: allProducts.length,
    displayedProducts: displayedProducts.length,
    loading,
    showLoadAll,
    isShowingAll: showAll || hasActiveFilters,
    filters,
    hasActiveFilters,
    setSearch: handleSetSearch,
    setTagFilter: handleSetTagFilter,
    loadAllProducts,
    clearFilters,
    addProduct,
    updateProduct,
    deleteProduct
  };
}