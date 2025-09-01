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

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['site_info', 'uti_pro_settings']);

      if (error) throw error;

      if (data) {
        data.forEach((setting) => {
          if (setting.setting_key === 'site_info') {
            setSiteInfo(setting.setting_value as unknown as SiteInfo);
          } else if (setting.setting_key === 'uti_pro_settings') {
            setUtiProSettings(setting.setting_value as unknown as UTIProSettings);
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
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
    updateSiteInfo,
    updateUTIProSettings,
    refreshSettings: loadSettings
  };
};