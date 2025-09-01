import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGlobalNavigationLinks } from '@/hooks/useGlobalNavigationLinks';
import SearchSuggestions from '@/components/SearchSuggestions';
import { cn } from '@/lib/utils';

const DesktopSearchBar = () => {
  const { navigateToSearch } = useGlobalNavigationLinks();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchSubmit = async () => {
    if (searchQuery.trim()) {
      await navigateToSearch(searchQuery.trim());
      setShowSuggestions(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    await navigateToSearch(suggestion);
  };

  return (
    // Desktop search bar - sempre visível em desktop (lg+)
    <div className="hidden lg:flex flex-1 relative">
      <div className="relative w-full">
        <Search
          className={cn(
            "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5",
            "cursor-pointer hover:text-gray-600 transition-colors"
          )}
          onClick={handleSearchSubmit}
        />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar jogos, consoles, acessórios..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setShowSuggestions(e.target.value.length > 1);
          }}
          onKeyPress={handleSearchKeyPress}
          onFocus={() => setShowSuggestions(searchQuery.length > 1)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="input-professional pl-12 pr-4 h-12 text-base bg-gray-50 border-gray-200 focus:bg-white w-full"
        />
      </div>
      
      <SearchSuggestions
        searchQuery={searchQuery}
        onSelectSuggestion={handleSuggestionSelect}
        onSearch={handleSearchSubmit}
        isVisible={showSuggestions}
      />
    </div>
  );
};

export default DesktopSearchBar;

