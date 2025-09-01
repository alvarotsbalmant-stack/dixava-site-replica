import { useCallback } from 'react';
import { useGlobalNavigation } from '@/contexts/GlobalNavigationContext';

export const useGlobalNavigationLinks = () => {
  const { navigateGlobally } = useGlobalNavigation();

  // Função para navegar para páginas de categoria
  const navigateToCategory = useCallback(async (category: string) => {
    await navigateGlobally(`/${category}`);
  }, [navigateGlobally]);

  // Função para navegar para página de produto
  const navigateToProduct = useCallback(async (productId: string) => {
    await navigateGlobally(`/produto/${productId}`);
  }, [navigateGlobally]);

  // Função para navegar para busca
  const navigateToSearch = useCallback(async (query: string) => {
    const searchPath = `/busca?q=${encodeURIComponent(query)}`;
    await navigateGlobally(searchPath);
  }, [navigateGlobally]);

  // Função para navegar para home
  const navigateToHome = useCallback(async () => {
    await navigateGlobally('/');
  }, [navigateGlobally]);

  // Função genérica para qualquer caminho
  const navigateTo = useCallback(async (path: string, options?: { replace?: boolean; state?: any }) => {
    await navigateGlobally(path, options);
  }, [navigateGlobally]);

  // Função para interceptar cliques em links
  const handleLinkClick = useCallback((
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    path: string,
    options?: { replace?: boolean; state?: any }
  ) => {
    event.preventDefault();
    navigateTo(path, options);
  }, [navigateTo]);

  // Função para criar props de link que usam navegação global
  const createLinkProps = useCallback((path: string, options?: { replace?: boolean; state?: any }) => {
    return {
      onClick: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        handleLinkClick(event, path, options);
      },
      href: path, // Manter href para acessibilidade
      role: 'button',
      style: { cursor: 'pointer' }
    };
  }, [handleLinkClick]);

  return {
    navigateToCategory,
    navigateToProduct,
    navigateToSearch,
    navigateToHome,
    navigateTo,
    handleLinkClick,
    createLinkProps
  };
};

