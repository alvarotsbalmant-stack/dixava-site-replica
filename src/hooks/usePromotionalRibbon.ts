import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PromotionalRibbonConfig {
  id?: string;
  device_type: 'mobile' | 'desktop';
  is_active: boolean;
  text: string;
  background_color: string;
  text_color: string;
  link_url?: string;
  background_type?: 'solid' | 'gradient';
  gradient_colors?: string;
}

export const usePromotionalRibbon = () => {
  const [mobileConfig, setMobileConfig] = useState<PromotionalRibbonConfig | null>(null);
  const [desktopConfig, setDesktopConfig] = useState<PromotionalRibbonConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotional_ribbon_config')
        .select('*');

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações da fita:', error);
        return;
      }

      if (data && data.length > 0) {
        // Otimizar processamento dos dados
        const configs = data.reduce((acc, config) => {
          if (config.device_type === 'mobile') {
            acc.mobile = config;
          } else if (config.device_type === 'desktop') {
            acc.desktop = config;
          }
          return acc;
        }, { mobile: null, desktop: null });

        setMobileConfig(configs.mobile);
        setDesktopConfig(configs.desktop);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da fita:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  // Memoizar retorno do hook
  return useMemo(() => ({
    mobileConfig,
    desktopConfig,
    loading,
    refetch: loadConfigs
  }), [mobileConfig, desktopConfig, loading, loadConfigs]);
};

