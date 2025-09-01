
import { supabase } from '@/integrations/supabase/client';
import { sendOrderCreatedEmail } from './orderEmailService';

export const generateOrderVerificationCode = async (cartItems: any[], total: number) => {
  console.log('🔐 generateOrderVerificationCode called with items:', cartItems.length, 'total:', total);
  
  try {
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
    console.log('📦 Items prepared:', items);

    // Preparar dados do cliente
    const customerInfo = {
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent
    };
    console.log('👤 Customer info prepared:', customerInfo);

    // Obter dados do usuário se logado
    console.log('🔍 Getting user data...');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 User:', user?.id || 'not logged in');

    // Chamar função do Supabase
    console.log('📞 Calling supabase RPC create_order_verification_code...');
    const { data, error } = await supabase.rpc('create_order_verification_code', {
      p_user_id: user?.id || null,
      p_items: items,
      p_total_amount: total,
      p_customer_info: customerInfo,
      p_browser_info: { userAgent: navigator.userAgent }
    });

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      throw error;
    }
    console.log('✅ Supabase RPC response:', data);

    const result = data as any;
    if (result?.success) {
      console.log('✅ Code generated successfully:', result.code);
      return result.code;
    } else {
      console.error('❌ RPC returned error:', result?.message);
      throw new Error(result?.message || 'Erro ao gerar código');
    }
  } catch (err) {
    console.error('❌ Error in generateOrderVerificationCode:', err);
    return null;
  }
};

// Função para detectar se é mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Função para detectar se é iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Função robusta para redirecionamento WhatsApp
const openWhatsApp = (url: string, onLoadingStart?: () => void) => {
  const mobile = isMobile();
  const ios = isIOS();
  
  console.log('Abrindo WhatsApp:', { mobile, ios, url });
  
  // Ativar loading se callback fornecido
  if (onLoadingStart) {
    onLoadingStart();
  }
  
  if (mobile) {
    // Em mobile, usar window.location.href é mais confiável
    try {
      // Tentar abrir diretamente
      window.location.href = url;
    } catch (error) {
      console.error('Erro ao abrir WhatsApp via location.href:', error);
      // Fallback: tentar window.open
      try {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          // Se window.open falhou, mostrar link para o usuário
          showWhatsAppFallback(url);
        }
      } catch (error2) {
        console.error('Erro ao abrir WhatsApp via window.open:', error2);
        // Fallback simples sem popup
        window.location.href = url;
      }
    }
  } else {
    // Em desktop, tentar window.open primeiro
    try {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      // Verificar se o popup foi bloqueado
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.warn('Popup bloqueado, usando fallback');
        showWhatsAppFallback(url);
      } else {
        // Verificar se a janela ainda está aberta após um tempo
        setTimeout(() => {
          try {
            if (newWindow.closed) {
              console.log('Janela foi fechada pelo usuário');
            }
          } catch (e) {
            // Ignorar erros de cross-origin
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp via window.open:', error);
      showWhatsAppFallback(url);
    }
  }
};

// Função para mostrar fallback profissional quando o redirecionamento automático falha
const showWhatsAppFallback = (url: string) => {
  // Criar overlay escuro
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 9999;
    backdrop-filter: blur(2px);
  `;
  
  // Criar modal profissional
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid #e0e0e0;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    text-align: center;
    max-width: 420px;
    width: 90%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: modalSlideIn 0.3s ease-out;
  `;
  
  // Adicionar animação CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -60%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
  `;
  document.head.appendChild(style);
  
  modal.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        border-radius: 50%;
        margin: 0 auto 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
      ">
        🎮
      </div>
      <h3 style="
        color: #1f2937;
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
        line-height: 1.3;
      ">Não foi redirecionado?</h3>
      <p style="
        color: #6b7280;
        font-size: 14px;
        margin: 0;
        line-height: 1.5;
      ">Clique no botão abaixo para finalizar seu pedido no WhatsApp</p>
    </div>
    
    <div style="margin-bottom: 24px;">
      <a href="${url}" target="_blank" style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
        border: none;
        cursor: pointer;
        width: 100%;
        max-width: 280px;
      " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(220, 38, 38, 0.4)'" 
         onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 16px rgba(220, 38, 38, 0.3)'">
        <span style="font-size: 20px;">💬</span>
        Abrir WhatsApp
      </a>
    </div>
    
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px;
      background: #f3f4f6;
      border-radius: 8px;
      font-size: 12px;
      color: #6b7280;
    ">
      <span style="color: #dc2626;">🔒</span>
      <span>Conexão segura • UTI dos Games</span>
    </div>
    
    <button onclick="this.closest('.whatsapp-fallback-overlay').remove()" style="
      background: transparent;
      border: 1px solid #d1d5db;
      color: #6b7280;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='transparent'">
      Fechar
    </button>
  `;
  
  // Adicionar classes para identificação
  overlay.className = 'whatsapp-fallback-overlay';
  modal.className = 'whatsapp-fallback-modal';
  
  // Adicionar ao DOM
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Fechar ao clicar no overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  // Remover automaticamente após 15 segundos
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.remove();
    }
  }, 15000);
  
  // Cleanup do style quando remover
  overlay.addEventListener('remove', () => {
    if (style.parentElement) {
      style.remove();
    }
  });
};

export const sendToWhatsApp = async (cartItems: any[], phoneNumber: string = '5527996882090', trackWhatsAppClick?: (context?: string) => void, onLoadingStart?: () => void) => {
  console.log('📦 sendToWhatsApp utils called with:', cartItems.length, 'items');
  
  const itemsList = cartItems.map(item => 
    `• ${item.product.name} (${item.size}${item.color ? `, ${item.color}` : ''}) - Qtd: ${item.quantity} - R$ ${(item.product.price * item.quantity).toFixed(2)}`
  ).join('\n');
  
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  console.log('💰 Total calculated:', total);
  
  // Gerar código de verificação do pedido
  console.log('🔐 Generating order code...');
  const orderCode = await generateOrderVerificationCode(cartItems, total);
  
  if (!orderCode) {
    console.error('❌ Failed to generate order code');
    return null;
  }
  console.log('✅ Order code generated:', orderCode);

  // Enviar email de confirmação se o usuário estiver logado
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      console.log('📧 Sending email to:', user.email);
      await sendOrderCreatedEmail(
        user.email,
        user.user_metadata?.name || 'Cliente',
        orderCode
      );
    }
  } catch (err) {
    console.warn('📧 Email sending failed:', err);
  }
  
  const message = `Olá! Gostaria de pedir os seguintes itens da UTI DOS GAMES:\n\n${itemsList}\n\n*Total: R$ ${total.toFixed(2)}*\n\n🔐 *Código de Verificação:*\n${orderCode}\n\n📋 *Copie o código:*\n${orderCode}\n\nAguardo retorno! 🎮`;
  
  // Track WhatsApp click if tracking function is provided
  if (trackWhatsAppClick) {
    console.log('📊 Tracking WhatsApp click');
    trackWhatsAppClick('cart_checkout');
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  console.log('🚀 Opening WhatsApp with URL length:', whatsappUrl.length);
  
  // Usar função robusta para abrir WhatsApp com loading
  openWhatsApp(whatsappUrl, onLoadingStart);
  
  console.log('✅ WhatsApp process completed, returning code:', orderCode);
  return orderCode;
};

// Função para gerar código de um único produto
export const generateSingleProductCode = async (product: any, quantity: number = 1, additionalInfo?: any) => {
  console.log('🔑 [MOBILE DEBUG] generateSingleProductCode called:', {
    productName: product.name,
    quantity: quantity,
    additionalInfo: additionalInfo
  });
  
  const cartItems = [{
    product: product,
    quantity: quantity,
    size: additionalInfo?.size,
    color: additionalInfo?.color
  }];
  
  const total = product.price * quantity;
  console.log('📊 [MOBILE DEBUG] Cart items prepared:', cartItems);
  console.log('💰 [MOBILE DEBUG] Total calculated:', total);
  
  return await generateOrderVerificationCode(cartItems, total);
};

// Função para compra direta com código de verificação
export const sendSingleProductToWhatsApp = async (product: any, quantity: number = 1, additionalInfo?: any, trackWhatsAppClick?: (context?: string) => void, onLoadingStart?: () => void) => {
  console.log('🛍️ [MOBILE DEBUG] sendSingleProductToWhatsApp called:', {
    productName: product.name,
    quantity: quantity,
    additionalInfo: additionalInfo,
    isMobile: isMobile(),
    isIOS: isIOS()
  });
  
  const total = product.price * quantity;
  
  // Gerar código de verificação
  console.log('🔐 [MOBILE DEBUG] Generating single product code...');
  const orderCode = await generateSingleProductCode(product, quantity, additionalInfo);
  
  if (!orderCode) {
    console.error('❌ [MOBILE DEBUG] Failed to generate order code for single product');
    return false;
  }
  console.log('✅ [MOBILE DEBUG] Single product code generated:', orderCode);

  // Enviar email de confirmação se o usuário estiver logado
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      console.log('📧 Sending single product email to:', user.email);
      await sendOrderCreatedEmail(
        user.email,
        user.user_metadata?.name || 'Cliente',
        orderCode
      );
    }
  } catch (err) {
    console.warn('📧 Single product email failed:', err);
  }
  
  const message = `Olá! Gostaria de comprar este produto da UTI DOS GAMES:

📦 *${product.name}*
💰 Preço: R$ ${product.price.toFixed(2)}
📊 Quantidade: ${quantity}
💵 *Total: R$ ${total.toFixed(2)}*

🔐 *Código de Verificação:*
${orderCode}

📋 *Copie o código:*
${orderCode}

Aguardo retorno! 🎮`;
  
  // Track WhatsApp click if tracking function is provided
  if (trackWhatsAppClick) {
    console.log('📊 Tracking single product WhatsApp click');
    trackWhatsAppClick('single_product_purchase');
  }

  const whatsappUrl = `https://wa.me/5527996882090?text=${encodeURIComponent(message)}`;
  console.log('🚀 [MOBILE DEBUG] Opening single product WhatsApp:', {
    urlLength: whatsappUrl.length,
    messageIncludes: {
      productName: message.includes(product.name),
      verificationCode: message.includes(orderCode),
      total: message.includes(total.toFixed(2))
    }
  });
  
  // Usar função robusta para abrir WhatsApp com loading
  openWhatsApp(whatsappUrl, onLoadingStart);
  
  console.log('✅ [MOBILE DEBUG] Single product WhatsApp process completed');
  return orderCode;
};

// Função simples para redirecionamento direto (para casos específicos - SEM código)
// NUNCA usa window.open() - funciona como link normal
export const openWhatsAppDirect = (phoneNumber: string, message: string) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  
  // Usar apenas location.href - funciona como clicar em um link
  // Nunca causa popup bloqueado
  window.location.href = whatsappUrl;
};

export const formatWhatsAppMessage = (cartItems: any[]) => {
  const itemsList = cartItems.map(item => 
    `• ${item.product.name} (${item.size}${item.color ? `, ${item.color}` : ''}) - Qtd: ${item.quantity} - R$ ${(item.product.price * item.quantity).toFixed(2)}`
  ).join('\n');
  
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  return `Olá! Gostaria de pedir os seguintes itens da UTI DOS GAMES:\n\n${itemsList}\n\n*Total: R$ ${total.toFixed(2)}*\n\nAguardo retorno! 🎮`;
};
