import { useState, useCallback } from 'react';

export const useWhatsAppLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = useCallback(() => {
    setIsLoading(true);
    
    // Auto-hide após 3 segundos (tempo suficiente para o redirecionamento)
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    showLoading,
    hideLoading
  };
};

