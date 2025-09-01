import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUTICoinsSettings } from './useUTICoinsSettings';

export const useUTICoinsRouteProtection = () => {
  const { isEnabled, loading } = useUTICoinsSettings();
  const navigate = useNavigate();

  useEffect(() => {
    // Só aplicar proteção após carregamento
    if (!loading && !isEnabled) {
      // Redirecionar para home se sistema estiver desabilitado
      navigate('/', { replace: true });
    }
  }, [isEnabled, loading, navigate]);

  return { isEnabled, loading };
};