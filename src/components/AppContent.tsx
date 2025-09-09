import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePageScrollRestoration } from '@/hooks/usePageScrollRestoration';
import { BottomNavigationBar } from '@/components/Mobile/BottomNavigationBar';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import Cart from '@/components/Cart';
import MobileSearchBar from '@/components/Header/MobileSearchBar';
import { SimpleAuthModal } from '@/components/Auth/SimpleAuthModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface AppContentProps {
  children: React.ReactNode;
}

/**
 * Componente wrapper que integra o sistema de scroll horizontal
 * com a navegação do React Router e inclui a barra de navegação inferior global
 */
const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cartContext = useCart();
  
  // ✅ Estados locais 
  const [showCart, setShowCart] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFavoritesAlert, setShowFavoritesAlert] = useState(false);
  
  // Integra sistema simples de scroll horizontal com navegação
  usePageScrollRestoration();
  
  // Determina se deve mostrar a barra de navegação inferior
  // Oculta apenas na página de busca (/busca)
  const shouldShowBottomNav = !location.pathname.startsWith('/busca');
  
  // ✅ Handlers corrigidos como na versão antiga
  const handleSearchOpen = () => {
    setIsMobileSearchOpen(true);
  };
  
  const handleCartOpen = () => {
    setShowCart(true);
  };
  
  const handleAuthOpen = () => {
    setShowAuthModal(true);
  };

  const handleAuthRequired = () => {
    setShowFavoritesAlert(true);
  };
  
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
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
          onAuthRequired={handleAuthRequired}
        />
      )}
      
      {/* ✅ Cart modal como na versão antiga */}
      <Cart
        showCart={showCart}
        setShowCart={setShowCart}
      />
      
      {/* ✅ Mobile search bar como na versão antiga */}
      <MobileSearchBar 
        isOpen={isMobileSearchOpen} 
        onClose={toggleMobileSearch} 
      />

      {/* Modal de autenticação */}
      <SimpleAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Alert para favoritos */}
      <AlertDialog open={showFavoritesAlert} onOpenChange={setShowFavoritesAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Necessário</AlertDialogTitle>
            <AlertDialogDescription>
              Você precisa estar logado para favoritar produtos. Faça login ou crie uma conta para continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowFavoritesAlert(false);
              setShowAuthModal(true);
            }}>
              Entrar / Cadastrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppContent;

