
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainHeader from './MainHeader';
import DesktopNavigation from './DesktopNavigation';
import MobileMenuEnhanced from './MobileMenuEnhanced';
import { categories, Category } from './categories';
import { cn } from '@/lib/utils';

interface ProfessionalHeaderProps {
  onCartOpen?: () => void;
  onAuthOpen?: () => void;
  onMobileMenuToggle?: () => void;
  showNavigation?: boolean;
  // Additional props that components are passing
  user?: any;
  cartItemsCount?: number;
  onCartClick?: () => void;
  onAuthClick?: () => void;
}

const ProfessionalHeader = ({ 
  onCartOpen, 
  onAuthOpen, 
  onCartClick, 
  onAuthClick, 
  showNavigation = true 
}: ProfessionalHeaderProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategoryClick = (category: Category) => {
    navigate(category.path);
    setMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => {
      const isOpen = !prev;
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return isOpen;
    });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleCartOpen = () => {
    console.log('[ProfessionalHeader] handleCartOpen called');
    console.log('[ProfessionalHeader] onCartOpen:', !!onCartOpen);
    console.log('[ProfessionalHeader] onCartClick:', !!onCartClick);
    
    const cartHandler = onCartOpen || onCartClick;
    if (cartHandler) {
      console.log('[ProfessionalHeader] Calling cart handler');
      cartHandler();
    } else {
      console.warn('ProfessionalHeader: No cart handler provided');
    }
  };

  const handleAuthOpen = () => {
    const authHandler = onAuthOpen || onAuthClick;
    if (authHandler) {
      authHandler();
    } else {
      console.warn('ProfessionalHeader: No auth handler provided');
    }
  };

  return (
    <>
      {/* MainHeader agora é fixed e não precisa de container wrapper */}
      <MainHeader
        onCartOpen={handleCartOpen}
        onAuthOpen={handleAuthOpen}
        onMobileMenuToggle={toggleMobileMenu}
      />

      {/* DesktopNavigation agora é fixed e posicionado abaixo do MainHeader */}
      {showNavigation && <DesktopNavigation />}

      {/* Espaçador para compensar o header fixo - APENAS no desktop */}
      <div className="hidden lg:block h-[72px]" />
      
      {/* Espaçador adicional para navegação desktop - apenas quando navegação está ativa e em desktop */}
      {showNavigation && <div className="hidden lg:block h-[12px]" />}

      {/* MobileMenuEnhanced com sistema de autenticação integrado */}
      <MobileMenuEnhanced
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        onAuthOpen={handleAuthOpen}
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />
    </>
  );
};

export default ProfessionalHeader;
