import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UTICoinsSettings {
  enabled: boolean;
}

// Cache global para evitar múltiplas requisições
let globalCache: { isEnabled: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 30000; // 30 segundos

export const useUTICoinsSettings = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  const loadSettings = async () => {
    // Verificar cache primeiro
    if (globalCache && Date.now() - globalCache.timestamp < CACHE_DURATION) {
      setIsEnabled(globalCache.isEnabled);
      setLoading(false);
      return;
    }

    try {
      // Usar nova arquitetura consolidada em coin_system_config
      const { data, error } = await supabase
        .from('coin_system_config')
        .select('setting_value')
        .eq('setting_key', 'system_enabled')
        .single();

      if (error) {
        console.warn('Erro ao carregar configurações UTI Coins:', error);
        setIsEnabled(false);
        return;
      }

      const newIsEnabled = data?.setting_value === 'true' || data?.setting_value === true;
      console.log('[UTI COINS DEBUG] Settings loaded:', { data, newIsEnabled });
      setIsEnabled(newIsEnabled);
      
      // Atualizar cache global
      globalCache = {
        isEnabled: newIsEnabled,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Erro ao carregar configurações UTI Coins:', error);
      setIsEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();

    // Criar nome único para evitar conflitos de canal
    const channelName = `uti_coins_settings_${Math.random().toString(36).substring(7)}`;
    
    // Listener para mudanças em tempo real na nova tabela
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'coin_system_config',
          filter: 'setting_key=eq.system_enabled'
        },
        (payload) => {
          if (payload.new?.setting_value) {
            const newIsEnabled = payload.new.setting_value === 'true' || payload.new.setting_value === true;
            setIsEnabled(newIsEnabled);
            
            // Atualizar cache global
            globalCache = {
              isEnabled: newIsEnabled,
              timestamp: Date.now()
            };
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    isEnabled,
    loading,
    refreshSettings: loadSettings
  };
};