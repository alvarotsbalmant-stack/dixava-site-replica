import { useState, useEffect } from 'react';

interface EnterpriseAnalyticsConfig {
  enabled: boolean;
  hybridMode: boolean; // Usar ambos os sistemas em paralelo
  debugMode: boolean;
  flushInterval: number; // Intervalo para envio de eventos em ms
  maxEventsPerBatch: number; // Máximo de eventos por lote
  enableRealTimeActivity: boolean;
  enableMouseTracking: boolean;
  enableScrollTracking: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
}

const ENTERPRISE_CONFIG_KEY = 'enterprise-analytics-config';

const defaultConfig: EnterpriseAnalyticsConfig = {
  enabled: true, // Ativar por padrão
  hybridMode: true, // Manter sistema básico funcionando
  debugMode: process.env.NODE_ENV === 'development',
  flushInterval: 5000, // 5 segundos
  maxEventsPerBatch: 10,
  enableRealTimeActivity: true,
  enableMouseTracking: true,
  enableScrollTracking: true,
  enablePerformanceTracking: true,
  enableErrorTracking: true
};

export const useEnterpriseAnalyticsConfig = () => {
  const [config, setConfig] = useState<EnterpriseAnalyticsConfig>(defaultConfig);

  useEffect(() => {
    const savedConfig = localStorage.getItem(ENTERPRISE_CONFIG_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsedConfig });
        console.log('🚀 Enterprise Analytics Config loaded:', parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configuração enterprise:', error);
      }
    } else {
      // Salvar configuração padrão
      localStorage.setItem(ENTERPRISE_CONFIG_KEY, JSON.stringify(defaultConfig));
      console.log('🚀 Enterprise Analytics Config initialized with defaults');
    }
  }, []);

  const updateConfig = (newConfig: Partial<EnterpriseAnalyticsConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem(ENTERPRISE_CONFIG_KEY, JSON.stringify(updatedConfig));
    console.log('🚀 Enterprise Analytics Config updated:', updatedConfig);
  };

  const toggleEnterprise = () => {
    updateConfig({ enabled: !config.enabled });
  };

  const toggleHybridMode = () => {
    updateConfig({ hybridMode: !config.hybridMode });
  };

  const toggleDebugMode = () => {
    updateConfig({ debugMode: !config.debugMode });
  };

  return {
    config,
    updateConfig,
    toggleEnterprise,
    toggleHybridMode,
    toggleDebugMode,
    isEnterpriseEnabled: config.enabled,
    isHybridMode: config.hybridMode,
    isDebugMode: config.debugMode
  };
};

