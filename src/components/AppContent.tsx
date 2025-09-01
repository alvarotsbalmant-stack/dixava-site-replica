import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { usePageScrollRestoration } from '@/hooks/usePageScrollRestoration';
import { BottomNavigationBar } from '@/components/Mobile/BottomNavigationBar';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';

interface AppContentProps {
  children: React.ReactNode;
}

/**
 * Componente wrapper que integra o sistema de scroll horizontal
 * com a navegação do React Router e inclui a barra de navegação inferior global
 */
const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const location = useLocation();
  const { openAuthModal } = useAuth();
  const { toggleCart } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Integra sistema simples de scroll horizontal com navegação
  usePageScrollRestoration();
  
  // Determina se deve mostrar a barra de navegação inferior
  // Oculta apenas na página de busca (/busca)
  const shouldShowBottomNav = !location.pathname.startsWith('/busca');
  
  const handleSearchOpen = () => {
    setIsSearchOpen(true);
    // Navegar para a página de busca ou abrir modal de busca
    window.location.href = '/busca';
  };
  
  const handleCartOpen = () => {
    toggleCart();
  };
  
  const handleAuthOpen = () => {
    openAuthModal();
  };
  
  return (
    <>
      {children}
      
      {/* Barra de navegação inferior global - visível em todas as páginas exceto busca */}
      {shouldShowBottomNav && (
        <BottomNavigationBar 
          onSearchOpen={handleSearchOpen}
          onCartOpen={handleCartOpen}
          onAuthOpen={handleAuthOpen}
        />
      )}
    </>
  );
};

export default AppContent;

