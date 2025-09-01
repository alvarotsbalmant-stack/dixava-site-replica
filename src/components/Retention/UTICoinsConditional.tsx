import React, { memo } from 'react';
import { useUTICoinsSettings } from '@/hooks/useUTICoinsSettings';

interface UTICoinsConditionalProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const UTICoinsConditional: React.FC<UTICoinsConditionalProps> = memo(({ 
  children, 
  fallback = null 
}) => {
  const { isEnabled, loading } = useUTICoinsSettings();

  console.log('[UTI COINS CONDITIONAL] State:', { isEnabled, loading });

  // Não renderizar nada durante o carregamento
  if (loading) {
    console.log('[UTI COINS CONDITIONAL] Ainda carregando...');
    return null;
  }

  // Só renderizar o children se o sistema estiver habilitado
  if (!isEnabled) {
    console.log('[UTI COINS CONDITIONAL] Sistema desabilitado - não renderizando');
    return <>{fallback}</>;
  }

  console.log('[UTI COINS CONDITIONAL] Sistema habilitado - renderizando children');
  return <>{children}</>;
});

UTICoinsConditional.displayName = 'UTICoinsConditional';