import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoreSettings {
  free_shipping_minimum: number;
  free_shipping_regions: string[];
  standard_delivery_days: string;
  express_delivery_days: string;
  express_delivery_price: number;
  store_address: string;
  company_cnpj: string;
  cutoff_time: string;
  company_name: string;
  years_in_market: number;
  satisfied_customers: number;
}

export interface DeliverySettings {
  region: string;
  free_shipping_minimum: number;
  standard_days: string;
  express_days: string;
  express_price: number;
  cutoff_time: string;
  active: boolean;
}

export interface TrustBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bg_color: string;
  active: boolean;
  order_index: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  icon: string;
  discount_percentage: number;
  max_installments: number;
  min_installment_value: number;
  active: boolean;
  order_index: number;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  free_shipping_minimum: 99.00,
  free_shipping_regions: ['Brasil'],
  standard_delivery_days: '3-5',
  express_delivery_days: '2-3',
  express_delivery_price: 15.90,
  store_address: 'Colatina - ES',
  company_cnpj: '16.811.173/0001-20',
  cutoff_time: '14:00',
  company_name: 'UTI dos Games',
  years_in_market: 15,
  satisfied_customers: 50000,
};

export const useStoreSettings = () => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'store_settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configurações da loja:', error);
        return;
      }

      if (data?.setting_value) {
        setStoreSettings({ ...DEFAULT_STORE_SETTINGS, ...(data.setting_value as any) });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da loja:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const updatedSettings = { ...storeSettings, ...newSettings };
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'store_settings',
          setting_value: updatedSettings
        });

      if (error) throw error;

      setStoreSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configurações da loja:', error);
      return false;
    }
  };

  return {
    storeSettings,
    loading,
    updateStoreSettings,
    refreshSettings: loadStoreSettings
  };
};

export const useTrustBadges = () => {
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultBadges: TrustBadge[] = [
    {
      id: '1',
      title: 'Produto Original',
      description: 'Lacrado e garantido',
      icon: '🛡️',
      color: '#10b981',
      bg_color: '#ecfdf5',
      active: true,
      order_index: 1
    },
    {
      id: '2',
      title: 'Entrega Rápida',
      description: '3-5 dias úteis',
      icon: '🚚',
      color: '#3b82f6',
      bg_color: '#eff6ff',
      active: true,
      order_index: 2
    },
    {
      id: '3',
      title: 'Troca Garantida',
      description: '7 dias para trocar',
      icon: '🔄',
      color: '#f59e0b',
      bg_color: '#fffbeb',
      active: true,
      order_index: 3
    },
    {
      id: '4',
      title: 'Suporte Especializado',
      description: 'Atendimento especializado',
      icon: '💬',
      color: '#8b5cf6',
      bg_color: '#f5f3ff',
      active: true,
      order_index: 4
    }
  ];

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'trust_badges')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar badges:', error);
        setBadges(defaultBadges);
        return;
      }

      if (data?.setting_value) {
        setBadges(data.setting_value as any);
      } else {
        setBadges(defaultBadges);
      }
    } catch (error) {
      console.error('Erro ao carregar badges:', error);
      setBadges(defaultBadges);
    } finally {
      setLoading(false);
    }
  };

  return {
    badges: badges.filter(badge => badge.active).sort((a, b) => a.order_index - b.order_index),
    loading,
    refreshBadges: loadBadges
  };
};

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      name: 'PIX',
      type: 'pix',
      icon: '💳',
      discount_percentage: 5,
      max_installments: 1,
      min_installment_value: 0,
      active: true,
      order_index: 1
    },
    {
      id: '2', 
      name: 'Visa',
      type: 'credit_card',
      icon: '💳',
      discount_percentage: 0,
      max_installments: 12,
      min_installment_value: 20,
      active: true,
      order_index: 2
    },
    {
      id: '3',
      name: 'Mastercard', 
      type: 'credit_card',
      icon: '💳',
      discount_percentage: 0,
      max_installments: 12,
      min_installment_value: 20,
      active: true,
      order_index: 3
    },
    {
      id: '4',
      name: 'Débito Visa',
      type: 'debit_card',
      icon: '💳',
      discount_percentage: 3,
      max_installments: 1,
      min_installment_value: 0,
      active: true,
      order_index: 4
    }
  ];

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'payment_methods')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar métodos de pagamento:', error);
        setPaymentMethods(defaultPaymentMethods);
        return;
      }

      if (data?.setting_value) {
        setPaymentMethods(data.setting_value as any);
      } else {
        setPaymentMethods(defaultPaymentMethods);
      }
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      setPaymentMethods(defaultPaymentMethods);
    } finally {
      setLoading(false);
    }
  };

  return {
    paymentMethods: paymentMethods.filter(method => method.active).sort((a, b) => a.order_index - b.order_index),
    loading,
    refreshPaymentMethods: loadPaymentMethods
  };
};