import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UIStateContextType {
  // Estados que podem ocultar o widget
  isMobileSearchOpen: boolean;
  setIsMobileSearchOpen: (open: boolean) => void;
  
  // Outros estados que podem ser adicionados no futuro
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  
  // Função helper para verificar se widget deve ser oculto
  shouldHideWidget: () => boolean;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

interface UIStateProviderProps {
  children: ReactNode;
}

export const UIStateProvider: React.FC<UIStateProviderProps> = ({ children }) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shouldHideWidget = () => {
    // Widget deve ser oculto se qualquer uma dessas condições for verdadeira
    return isMobileSearchOpen || isMobileMenuOpen || isModalOpen;
  };

  const value: UIStateContextType = {
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isModalOpen,
    setIsModalOpen,
    shouldHideWidget,
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = (): UIStateContextType => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};

