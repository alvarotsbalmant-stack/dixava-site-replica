import React from 'react';
import { X, ShoppingCart, Truck, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendSingleProductToWhatsApp } from '@/utils/whatsapp';

interface PurchaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
  };
  quantity: number;
}

export const PurchaseConfirmationModal: React.FC<PurchaseConfirmationModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity
}) => {
  if (!isOpen) return null;

  const subtotal = product.price * quantity;
  const originalSubtotal = product.originalPrice ? product.originalPrice * quantity : subtotal;
  const productDiscount = originalSubtotal - subtotal;
  const freeShippingThreshold = 150;
  const needsForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const hasFreeShipping = subtotal >= freeShippingThreshold;
  const shippingValue = hasFreeShipping ? 25 : 0; // Valor estimado do frete grátis
  const totalSavings = productDiscount + shippingValue;

  const handleWhatsAppProceed = async () => {
    // Usar nova função para gerar código de verificação
    const success = await sendSingleProductToWhatsApp(product, quantity, null, () => {
      // Track analytics se necessário
    });

    if (success) {
      onClose(); // Fechar modal após sucesso
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Confirmar Compra</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Banner de Economia Total */}
          {totalSavings > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
                <span className="text-green-800 font-semibold text-lg">VOCÊ ESTÁ ECONOMIZANDO</span>
              </div>
              <div className="text-green-700 font-bold text-2xl">
                R$ {totalSavings.toFixed(2).replace('.', ',')}
              </div>
              <div className="text-green-600 text-sm mt-1">
                {productDiscount > 0 && `Desconto: R$ ${productDiscount.toFixed(2).replace('.', ',')}`}
                {productDiscount > 0 && hasFreeShipping && ' + '}
                {hasFreeShipping && `Frete grátis: R$ ${shippingValue.toFixed(2).replace('.', ',')}`}
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="flex items-center gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
              <p className="text-sm text-gray-600">Quantidade: {quantity}</p>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Preço Original (se houver desconto) */}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-sm">Preço original</span>
                <span className="line-through">R$ {originalSubtotal.toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>

            {productDiscount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm flex items-center gap-1">
                  <Calculator className="w-4 h-4" />
                  Desconto do produto
                </span>
                <span className="font-medium">-R$ {productDiscount.toFixed(2).replace('.', ',')}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Frete
              </span>
              {hasFreeShipping ? (
                <div className="text-right">
                  <span className="font-medium text-green-600">GRÁTIS</span>
                  <div className="text-xs text-green-500">Economia: R$ {shippingValue.toFixed(2).replace('.', ',')}</div>
                </div>
              ) : (
                <span className="text-sm text-gray-600">A combinar</span>
              )}
            </div>

            {!hasFreeShipping && (
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                💡 Faltam apenas R$ {needsForFreeShipping.toFixed(2).replace('.', ',')} para frete grátis!
              </div>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-red-600">
                R$ {subtotal.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* WhatsApp Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.506"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-green-800">Atendimento Especializado</span>
            </div>
            <p className="text-xs text-green-700">
              <strong>Finalizamos via WhatsApp</strong> com nossa <em>equipe especializada</em> para melhor atendimento
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Continuar Comprando
          </Button>
          <Button
            onClick={handleWhatsAppProceed}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Prosseguir
          </Button>
        </div>
      </div>
    </div>
  );
};

