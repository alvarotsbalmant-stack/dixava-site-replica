import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalNavigationLinks } from '@/hooks/useGlobalNavigationLinks';
import SearchSuggestions from '@/components/SearchSuggestions';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUIState } from '@/contexts/UIStateContext';

interface MobileSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSearchBar = ({ isOpen, onClose }: MobileSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { navigateToSearch } = useGlobalNavigationLinks();
  const isMobile = useIsMobile();
  const { setIsMobileSearchOpen } = useUIState();

  // Sincronizar estado com UIState
  useEffect(() => {
    setIsMobileSearchOpen(isOpen);
  }, [isOpen, setIsMobileSearchOpen]);

  // Focus input when the search bar opens
  useEffect(() => {
    if (isOpen) {
      // Short delay to allow the element to render before focusing
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      // Prevent body scroll when search is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when search closes
      document.body.style.overflow = '';
      // Reset search state on close
      setSearchQuery('');
      setShowSuggestions(false);
    }
    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearchSubmit = async () => {
    if (searchQuery.trim()) {
      await navigateToSearch(searchQuery.trim());
      setShowSuggestions(false);
      onClose(); // Close the search bar after submitting
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      onClose(); // Close on Escape key
    }
  };

  const handleSuggestionSelect = async (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    await navigateToSearch(suggestion);
    onClose(); // Close after selecting suggestion
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-white lg:hidden" // Funciona até desktop (lg)
        >
          {/* Header */}
          <div className="flex items-center p-4 border-b border-gray-200 h-[72px]"> {/* Match header height */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                // Use timeout on blur to allow suggestion clicks
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                className="pl-10 pr-4 h-12 bg-gray-50 border-gray-200 focus:bg-white w-full"
              />
            </div>
            
            <Button 
              onClick={onClose} // Use the passed onClose function
              variant="ghost" 
              size="icon" // Make it icon size for consistency
              className={cn(
                "ml-2 text-gray-600 p-2 h-10 w-10", // Consistent size
                !isMobile && "hover:text-uti-red hover:bg-secondary"
              )}
              aria-label="Fechar busca"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Search Suggestions Area */}
          <div className="relative">
            <SearchSuggestions
              searchQuery={searchQuery}
              onSelectSuggestion={handleSuggestionSelect}
              onSearch={handleSearchSubmit}
              isVisible={showSuggestions}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileSearchBar;
