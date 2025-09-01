
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/hooks/useProducts';
import { normalizeText, fuzzySearch } from '@/utils/fuzzySearch';

interface SearchSuggestionsProps {
  searchQuery: string;
  onSelectSuggestion: (suggestion: string) => void;
  onSearch: () => void;
  isVisible: boolean;
}

const SearchSuggestions = ({ searchQuery, onSelectSuggestion, onSearch, isVisible }: SearchSuggestionsProps) => {
  const { products } = useProducts();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const uniqueSuggestions = new Set<string>();
    const normalizedQuery = normalizeText(searchQuery);
    
    products.forEach((product: Product) => {
      // Adicionar nome do produto se corresponde à busca fuzzy
      if (fuzzySearch(normalizedQuery, product.name, 0.4) || 
          normalizeText(product.name).includes(normalizedQuery)) {
        uniqueSuggestions.add(product.name);
      }
      
      // Adicionar tags se correspondem à busca
      if (product.tags) {
        product.tags.forEach(tag => {
          if (fuzzySearch(normalizedQuery, tag.name, 0.4) || 
              normalizeText(tag.name).includes(normalizedQuery)) {
            uniqueSuggestions.add(tag.name);
          }
        });
      }
    });

    // Limitar a 5 sugestões e priorizar por relevância
    const sortedSuggestions = Array.from(uniqueSuggestions)
      .sort((a, b) => {
        const aIncludes = normalizeText(a).includes(normalizedQuery);
        const bIncludes = normalizeText(b).includes(normalizedQuery);
        
        if (aIncludes && !bIncludes) return -1;
        if (!aIncludes && bIncludes) return 1;
        
        return a.length - b.length; // Preferir sugestões mais curtas
      })
      .slice(0, 5);

    setSuggestions(sortedSuggestions);
  }, [searchQuery, products]);

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelectSuggestion(suggestion)}
          className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-center gap-2 transition-colors duration-150"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">{suggestion}</span>
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;
