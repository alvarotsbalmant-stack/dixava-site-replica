import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/contexts/AnalyticsContext';

const CheckoutButton = () => {
  const { items, sendToWhatsApp, getCartTotal, getCartItemsCount } = useCart();
  const { toast } = useToast();
  const { trackCheckoutStart, trackWhatsAppClick, trackCheckoutAbandon } = useAnalytics();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione alguns produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive"
      });
      return;
    }

    const cartTotal = getCartTotal();
    const itemCount = getCartItemsCount();
    
    // Track checkout start
    trackCheckoutStart(cartTotal, itemCount);

    try {
      // Track WhatsApp click
      trackWhatsAppClick('checkout_button');
      
      await sendToWhatsApp();
      toast({
        title: "Pedido enviado!",
        description: "Seu pedido foi enviado para o WhatsApp com o código de verificação.",
      });
    } catch (error) {
      // Track checkout abandonment
      trackCheckoutAbandon(cartTotal, itemCount, 'whatsapp_error');
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button 
      onClick={handleCheckout}
      className="w-full bg-green-600 hover:bg-green-700 text-white"
      size="lg"
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      Finalizar Compra (R$ {getCartTotal().toFixed(2)})
    </Button>
  );
};

export default CheckoutButton;