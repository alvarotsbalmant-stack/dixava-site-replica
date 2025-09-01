
import React, { useState } from 'react';
import MainHeader from './Header/MainHeader';
import MobileMenuEnhanced from './Header/MobileMenuEnhanced';
import { categories, Category } from './Header/categories';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onCartOpen?: () => void;
  onAuthOpen?: () => void;
}

// Este arquivo serve como um ponto de entrada para o componente Header
// Isso resolve o problema de importação em outros componentes que usam '@/components/Header'
const Header: React.FC<HeaderProps> = ({ onCartOpen, onAuthOpen }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleCartOpen = () => {
    if (onCartOpen) {
      onCartOpen();
    }
  };

  const handleAuthOpen = () => {
    if (onAuthOpen) {
      onAuthOpen();
    }
  };

  const handleMobileMenuToggle = () => {
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

  const handleCategoryClick = (category: Category) => {
    navigate(category.path);
    setMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
  };

  return (
    <>
      <MainHeader 
        onCartOpen={handleCartOpen}
        onAuthOpen={handleAuthOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
      />

      {/* MobileMenuEnhanced */}
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

export default Header;
