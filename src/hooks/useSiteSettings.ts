import { useState, useEffect } from 'react';
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

export const useSiteSettings = () => {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    siteName: 'UTI dos Games',
    siteSubtitle: 'Sua loja de games favorita',
    browserTitle: 'UTI dos Games - Sua loja de games favorita',
    selectedFont: 'Inter',
    logoUrl: '/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png',
    headerLayoutType: 'logo_title',
    headerImageUrl: '',
    disableHeaderImageCompression: false
  });

  const [utiProSettings, setUtiProSettings] = useState<UTIProSettings>({
    enabled: false
  });

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadSettings = async (retryCount = 0) => {
    try {
      console.log('🔧 [useSiteSettings] Carregando configurações do site...');
      
      // Timeout de 5 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar configurações')), 5000)
      );
      
      const dataPromise = supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['site_info', 'uti_pro_settings']);

      const { data, error } = await Promise.race([dataPromise, timeoutPromise]) as any;

      if (error) throw error;

      if (data) {
        console.log('✅ [useSiteSettings] Configurações carregadas com sucesso');
        data.forEach((setting) => {
          if (setting.setting_key === 'site_info') {
            setSiteInfo(setting.setting_value as unknown as SiteInfo);
          } else if (setting.setting_key === 'uti_pro_settings') {
            setUtiProSettings(setting.setting_value as unknown as UTIProSettings);
          }
        });
        setHasError(false);
      }
    } catch (error) {
      console.error('❌ [useSiteSettings] Erro ao carregar configurações:', error);
      
      // Retry até 2 vezes com delay
      if (retryCount < 2) {
        console.log(`🔄 [useSiteSettings] Tentativa ${retryCount + 1}/3 em 2 segundos...`);
        setTimeout(() => loadSettings(retryCount + 1), 2000);
        return; // Não finalizar loading ainda
      } else {
        console.log('⚠️ [useSiteSettings] Usando configurações padrão após falhas');
        setHasError(true);
      }
    } finally {
      // Finalizar loading após primeira tentativa ou após todas as tentativas
      if (retryCount === 0 || retryCount >= 2) {
        setLoading(false);
      }
    }
  };

  const updateSiteInfo = async (newSiteInfo: SiteInfo) => {
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
      setSiteInfo(newSiteInfo);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar informações do site:', error);
      return false;
    }
  };

  const updateUTIProSettings = async (newUTIProSettings: UTIProSettings) => {
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
      setUtiProSettings(newUTIProSettings);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações UTI Pro:', error);
      return false;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Atualizar título do navegador sempre que browserTitle mudar
  useEffect(() => {
    if (siteInfo.browserTitle) {
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
    refreshSettings: loadSettings
  };
};