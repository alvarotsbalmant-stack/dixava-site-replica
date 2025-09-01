import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { sendOrderCompletedEmail } from '@/utils/orderEmailService';

export interface OrderVerificationData {
  id: string;
  code: string;
  status: 'pending' | 'completed' | 'expired';
  items: any[];
  total_amount: number;
  customer_info: any;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  user_data?: any;
}

export const useOrderVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createOrderCode = async (cartItems: any[], total: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Preparar dados do cliente
      const customerInfo = {
        user_id: user?.id || null,
        email: user?.email || null,
        timestamp: new Date().toISOString()
      };

      // Preparar dados dos itens
      const items = cartItems.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color,
        total: item.product.price * item.quantity
      }));

      // Obter metadados do browser
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timestamp: new Date().toISOString()
      };

      // Chamar função do Supabase
      const { data, error } = await supabase.rpc('create_order_verification_code', {
        p_user_id: user?.id || null,
        p_items: items,
        p_total_amount: total,
        p_customer_info: customerInfo,
        p_browser_info: browserInfo
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        return result.code;
      } else {
        throw new Error(result?.message || 'Erro ao gerar código');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao criar código de verificação:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('verify_order_code', {
        p_code: code
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        return result;
      } else {
        throw new Error(result?.message || 'Código não encontrado');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao verificar código:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const completeOrder = async (code: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.rpc('complete_order_verification', {
        p_code: code,
        p_admin_id: user?.id
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        // Tentar enviar email de confirmação se possível
        try {
          const orderData = await verifyCode(code);
          if (orderData?.user_data?.email) {
            await sendOrderCompletedEmail(
              orderData.user_data.email,
              orderData.user_data.name || 'Cliente',
              result.coins_awarded || 20
            );
          }
        } catch (emailErr) {
          console.warn('Não foi possível enviar email de confirmação:', emailErr);
        }
        
        return result;
      } else {
        throw new Error(result?.message || 'Erro ao finalizar pedido');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao finalizar pedido:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getUserOrders = async () => {
    if (!user?.id) return [];
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('order_verification_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar pedidos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createOrderCode,
    verifyCode,
    completeOrder,
    getUserOrders
  };
};