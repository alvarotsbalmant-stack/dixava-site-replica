import { useState, useEffect, useCallback } from 'react';
import usePlatforms, { Platform } from '@/hooks/usePlatforms';

// Tipo para compatibilidade com código existente
export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

const useDynamicPlatforms = () => {
  const { fetchActivePlatforms } = usePlatforms();
  const [platformConfig, setPlatformConfig] = useState<Record<string, PlatformConfig>>({});
  const [loading, setLoading] = useState(true);

  // Buscar plataformas ativas e converter para formato do PLATFORM_CONFIG
  const loadPlatforms = useCallback(async () => {
    setLoading(true);
    try {
      const platforms = await fetchActivePlatforms();
      
      const config: Record<string, PlatformConfig> = {};
      platforms.forEach((platform: Platform) => {
        config[platform.slug] = {
          id: platform.slug,
          name: platform.name,
          icon: platform.icon_url || platform.icon_emoji,
          color: platform.color,
          description: 'Console de jogos'
        };
      });
      
      setPlatformConfig(config);
    } catch (error) {
      console.error('Erro ao carregar plataformas:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchActivePlatforms]);

  // Buscar todas as plataformas ativas
  const fetchAllActivePlatforms = useCallback(async () => {
    return await fetchActivePlatforms();
  }, [fetchActivePlatforms]);

  // Carregar plataformas na inicialização
  useEffect(() => {
    loadPlatforms();
  }, [loadPlatforms]);

  return {
    platformConfig,
    loading,
    loadPlatforms,
    fetchAllActivePlatforms
  };
};

export default useDynamicPlatforms;