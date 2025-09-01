import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';

interface BottomNavigationBarProps {
  onSearchOpen?: () => void;
  onCartOpen?: () => void;
  onAuthOpen?: () => void;
}

export const BottomNavigationBar = ({ 
  onSearchOpen, 
  onCartOpen, 
  onAuthOpen 
}: BottomNavigationBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Só renderiza no mobile
  if (!isMobile) return null;

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleSearchClick = () => {
    if (onSearchOpen) {
      onSearchOpen();
    }
  };

  const handleCartClick = () => {
    if (onCartOpen) {
      onCartOpen();
    }
  };

  const handleFavoritesClick = () => {
    navigate('/lista-desejos');
  };

  const handleAccountClick = () => {
    if (user) {
      navigate('/area-cliente');
    } else if (onAuthOpen) {
      onAuthOpen();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        
        {/* Home */}
        <button
          onClick={handleHomeClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors duration-200",
            isActive('/') 
              ? "text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Início</span>
        </button>

        {/* Search */}
        <button
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs font-medium">Buscar</span>
        </button>

        {/* Cart */}
        <button
          onClick={handleCartClick}
          className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 relative"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs font-medium">Carrinho</span>
          {/* Badge do carrinho pode ser adicionado aqui */}
        </button>

        {/* Favorites */}
        <button
          onClick={handleFavoritesClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors duration-200",
            isActive('/lista-desejos') 
              ? "text-red-500" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Heart className="w-5 h-5" />
          <span className="text-xs font-medium">Favoritos</span>
        </button>

        {/* Account */}
        <button
          onClick={handleAccountClick}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors duration-200",
            (isActive('/area-cliente') || isActive('/admin')) 
              ? "text-green-600" 
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-xs font-medium">
            {user ? 'Conta' : 'Entrar'}
          </span>
        </button>

      </div>
    </div>
  );
};

