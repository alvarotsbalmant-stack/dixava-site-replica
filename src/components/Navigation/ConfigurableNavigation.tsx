import React, { useEffect } from 'react';
import { NavigationItem } from './NavigationItem';
import { useNavigationItems } from '@/hooks/useNavigationItems';
import { Skeleton } from '@/components/ui/skeleton';

interface ConfigurableNavigationProps {
  className?: string;
  showOnlyVisible?: boolean;
}

export const ConfigurableNavigation: React.FC<ConfigurableNavigationProps> = ({ 
  className = '',
  showOnlyVisible = true 
}) => {
  const { items, loading, error, fetchVisibleItems, fetchItems } = useNavigationItems();

  useEffect(() => {
    if (showOnlyVisible) {
      fetchVisibleItems();
    } else {
      fetchItems();
    }
  }, [showOnlyVisible]);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-20 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Erro na navegação:', error);
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Erro ao carregar navegação
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Nenhum item de navegação encontrado
      </div>
    );
  }

  return (
    <nav className={`flex items-center gap-1 ${className}`} role="navigation">
      {items.map((item) => (
        <NavigationItem 
          key={item.id} 
          item={item}
        />
      ))}
    </nav>
  );
};

