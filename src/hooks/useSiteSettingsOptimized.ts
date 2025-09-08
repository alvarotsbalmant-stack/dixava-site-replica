/**
 * useSiteSettingsOptimized - Hook com Cache para Site Settings
 * 
 * Versão otimizada do useSiteSettings que implementa cache local
 * para evitar múltiplas chamadas simultâneas ao Supabase.
 * 
 * PROBLEMA IDENTIFICADO:
 * - MainHeader usa useSiteSettings em toda navegação
 * - Navegação rápida entre produtos causa múltiplas chamadas simultâneas
 * - Rate limiting do Supabase (ERR_INSUFFICIENT_RESOURCES)
 * 
 * SOLUÇÃO:
 * - Cache local com TTL de 10 minutos
 * - Request deduplication
 * - Fallback para configurações padrão
 */

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteInfo {
  siteName: string;
  siteSubtitle: string;
  browserTitle: string;
  selectedFont: string;
  logoUrl: string;
  headerLayoutType: 'logo_title' | 'single_image' | 'css_logo';
  headerImageUrl: string;
  disableHeaderImageCompression: boolean;
}

export interface UTIProSettings {
  enabled: boolean;
}

interface CachedSettings {
  siteInfo: SiteInfo;
  utiProSettings: UTIProSettings;
  timestamp: number;
  ttl: number;
}

// Cache global singleton para site settings
class SiteSettingsCache {
  private cache: CachedSettings | null = null;
  private requestPromise: Promise<void> | null = null;
  private readonly TTL = 10 * 60 * 1000; // 10 minutos
  
  private defaultSiteInfo: SiteInfo = {
    siteName: 'UTI dos Games',
    siteSubtitle: 'Sua loja de games favorita',
    browserTitle: 'UTI dos Games - Sua loja de games favorita',
    selectedFont: 'Inter',
    logoUrl: '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
    headerLayoutType: 'logo_title',
    headerImageUrl: '',
    disableHeaderImageCompression: false
  };

  private defaultUTIProSettings: UTIProSettings = {
    enabled: false
  };

  isExpired(): boolean {
    if (!this.cache) return true;
    return Date.now() - this.cache.timestamp > this.cache.ttl;
  }

  getFromCache(): { siteInfo: SiteInfo; utiProSettings: UTIProSettings } | null {
    if (!this.cache || this.isExpired()) {
      return null;
    }
    
    console.log('⚡ [SiteSettingsCache] Cache HIT - usando dados em cache');
    return {
      siteInfo: this.cache.siteInfo,
      utiProSettings: this.cache.utiProSettings
    };
  }

  async loadSettings(): Promise<{ siteInfo: SiteInfo; utiProSettings: UTIProSettings }> {
    // Request deduplication - evitar múltiplas chamadas simultâneas
    if (this.requestPromise) {
      console.log('🔄 [SiteSettingsCache] Request em andamento, aguardando...');
      await this.requestPromise;
      return this.getFromCache() || {
        siteInfo: this.defaultSiteInfo,
        utiProSettings: this.defaultUTIProSettings
      };
    }

    // Verificar cache primeiro
    const cached = this.getFromCache();
    if (cached) {
      return cached;
    }

    console.log('🌐 [SiteSettingsCache] Cache MISS - buscando do Supabase');

    this.requestPromise = this.fetchFromDatabase();
    
    try {
      await this.requestPromise;
      return this.getFromCache() || {
        siteInfo: this.defaultSiteInfo,
        utiProSettings: this.defaultUTIProSettings
      };
    } finally {
      this.requestPromise = null;
    }
  }

  private async fetchFromDatabase(): Promise<void> {
    try {
      // Timeout agressivo para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );
      
      const dataPromise = supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['site_info', 'uti_pro_settings']);

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

      if (error) throw error;

      let siteInfo = this.defaultSiteInfo;
      let utiProSettings = this.defaultUTIProSettings;

      if (data) {
        data.forEach((setting) => {
          if (setting.setting_key === 'site_info') {
            siteInfo = { ...this.defaultSiteInfo, ...setting.setting_value };
          } else if (setting.setting_key === 'uti_pro_settings') {
            utiProSettings = { ...this.defaultUTIProSettings, ...setting.setting_value };
          }
        });
      }

      // Salvar no cache
      this.cache = {
        siteInfo,
        utiProSettings,
        timestamp: Date.now(),
        ttl: this.TTL
      };

      console.log('✅ [SiteSettingsCache] Configurações salvas no cache');

    } catch (error) {
      console.warn('⚠️ [SiteSettingsCache] Erro ao buscar configurações, usando padrão:', error);
      
      // Salvar configurações padrão no cache por um tempo menor
      this.cache = {
        siteInfo: this.defaultSiteInfo,
        utiProSettings: this.defaultUTIProSettings,
        timestamp: Date.now(),
        ttl: 2 * 60 * 1000 // 2 minutos para retry mais rápido
      };
    }
  }

  clearCache(): void {
    console.log('🗑️ [SiteSettingsCache] Cache limpo');
    this.cache = null;
    this.requestPromise = null;
  }

  async updateSiteInfo(newSiteInfo: SiteInfo): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'site_info',
          setting_value: newSiteInfo as any
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      // Atualizar cache
      if (this.cache) {
        this.cache.siteInfo = newSiteInfo;
        this.cache.timestamp = Date.now();
      }

      return true;
    } catch (error) {
      console.error('❌ [SiteSettingsCache] Erro ao atualizar site info:', error);
      return false;
    }
  }

  async updateUTIProSettings(newUTIProSettings: UTIProSettings): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'uti_pro_settings',
          setting_value: newUTIProSettings as any
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      // Atualizar cache
      if (this.cache) {
        this.cache.utiProSettings = newUTIProSettings;
        this.cache.timestamp = Date.now();
      }

      return true;
    } catch (error) {
      console.error('❌ [SiteSettingsCache] Erro ao atualizar UTI Pro settings:', error);
      return false;
    }
  }
}

// Instância singleton
const siteSettingsCache = new SiteSettingsCache();

/**
 * Hook otimizado para site settings com cache inteligente
 */
export const useSiteSettingsOptimized = () => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(siteSettingsCache.getFromCache()?.siteInfo || {
    siteName: 'UTI dos Games',
    siteSubtitle: 'Sua loja de games favorita',
    browserTitle: 'UTI dos Games - Sua loja de games favorita',
    selectedFont: 'Inter',
    logoUrl: '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
    headerLayoutType: 'logo_title',
    headerImageUrl: '',
    disableHeaderImageCompression: false
  });

  const [utiProSettings, setUtiProSettings] = useState<UTIProSettings>(
    siteSettingsCache.getFromCache()?.utiProSettings || { enabled: false }
  );

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(true);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setHasError(false);

      const settings = await siteSettingsCache.loadSettings();
      
      if (mountedRef.current) {
        setSiteInfo(settings.siteInfo);
        setUtiProSettings(settings.utiProSettings);
        setHasError(false);
      }
    } catch (error) {
      console.error('❌ [useSiteSettingsOptimized] Erro:', error);
      if (mountedRef.current) {
        setHasError(true);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const updateSiteInfo = async (newSiteInfo: SiteInfo): Promise<boolean> => {
    const success = await siteSettingsCache.updateSiteInfo(newSiteInfo);
    if (success && mountedRef.current) {
      setSiteInfo(newSiteInfo);
    }
    return success;
  };

  const updateUTIProSettings = async (newUTIProSettings: UTIProSettings): Promise<boolean> => {
    const success = await siteSettingsCache.updateUTIProSettings(newUTIProSettings);
    if (success && mountedRef.current) {
      setUtiProSettings(newUTIProSettings);
    }
    return success;
  };

  const refreshSettings = () => {
    siteSettingsCache.clearCache();
    loadSettings();
  };

  useEffect(() => {
    mountedRef.current = true;
    loadSettings();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Atualizar título do navegador
  useEffect(() => {
    if (siteInfo.browserTitle && mountedRef.current) {
      document.title = siteInfo.browserTitle;
    }
  }, [siteInfo.browserTitle]);

  return {
    siteInfo,
    utiProSettings,
    loading,
    hasError,
    updateSiteInfo,
    updateUTIProSettings,
    refreshSettings
  };
};

export default useSiteSettingsOptimized;

