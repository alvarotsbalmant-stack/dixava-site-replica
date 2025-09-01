import { supabase } from '@/integrations/supabase/client';

export interface OrderEmailData {
  type: 'order_created' | 'order_completed';
  email: string;
  name: string;
  orderCode?: string;
  orderData?: any;
  coinsAwarded?: number;
}

export const sendOrderEmail = async (emailData: OrderEmailData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-order-emails', {
      body: emailData
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }

    console.log('Email enviado com sucesso:', data);
    return true;
  } catch (err) {
    console.error('Erro no serviço de email:', err);
    return false;
  }
};

export const sendOrderCreatedEmail = async (
  email: string, 
  name: string, 
  orderCode: string
) => {
  return sendOrderEmail({
    type: 'order_created',
    email,
    name,
    orderCode
  });
};

export const sendOrderCompletedEmail = async (
  email: string, 
  name: string, 
  coinsAwarded: number,
  orderData?: any
) => {
  return sendOrderEmail({
    type: 'order_completed',
    email,
    name,
    coinsAwarded,
    orderData
  });
};