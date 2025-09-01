import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X, Trash2, Plus, Minus, ShoppingBag, CreditCard, Gift } from 'lucide-react';
import { CartItem } from '@/types/cart';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CartSheetProps {
  isOpen?: boolean;
  showCart?: boolean;
  setShowCart?: (show: boolean) => void;
  items?: any[];
  onUpdateQuantity?: (productId: string, size: string, color: string, quantity: number) => void;
  onClose?: () => void;
  onSendToWhatsApp?: () => void;
  total?: number;
  updateQuantity?: (productId: string, size: string, color: string, quantity: number) => void;
  getCartTotal?: () => number;
  sendToWhatsApp?: () => void;
}

const Cart = ({ showCart = false, setShowCart }: CartSheetProps) => {
  const { 
    items: cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getCartTotal, 
    sendToWhatsApp 
  } = useCart();

  const handleQuantityChange = (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = Math.max(0, currentQuantity + change);
    const cartItem = cart.find(item => item.id === itemId);
    if (cartItem) {
      updateQuantity(cartItem.product.id, cartItem.size || '', cartItem.color || '', newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (removeFromCart) {
      removeFromCart(itemId);
    }
  };

  const handleClearCart = () => {
    if (clearCart) {
      clearCart();
    }
  };

  const totalPrice = getCartTotal ? getCartTotal() : 0;
  const itemCount = cart.length;
  const hasItems = itemCount > 0;
  const hasFreeShipping = totalPrice >= 200;

  // Detectar se é mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <Sheet open={showCart} onOpenChange={setShowCart}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-0 z-[100] border-0 shadow-2xl", 
          isMobile 
            ? "h-full w-full rounded-t-2xl" 
            : "h-full w-[90vw] md:w-[480px]",
          "bg-gradient-to-br from-white via-gray-50/50 to-white",
          "backdrop-blur-xl"
        )}
        style={isMobile ? {
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          transform: 'none',
          position: 'fixed'
        } : { 
          right: 0, 
          left: 'auto', 
          transform: 'none',
          position: 'fixed'
        }}
        aria-describedby="cart-title"
      >
        {/* Header Premium Simplificado */}
        <SheetHeader className="relative p-6 border-b border-gray-100/80 flex-row justify-between items-center flex-shrink-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10"></div>
          <div className="relative flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <SheetTitle id="cart-title" className="text-xl font-bold text-white">
                Seu Carrinho
              </SheetTitle>
              <p className="text-gray-300 text-sm">
                {itemCount} {itemCount === 1 ? 'item selecionado' : 'itens selecionados'}
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-2">
            {hasItems && clearCart && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearCart}
                className="text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl w-10 h-10 transition-colors duration-200"
                title="Limpar carrinho"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <SheetClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-300 hover:text-white hover:bg-white/10 rounded-xl w-10 h-10 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
                <span className="sr-only">Fechar</span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Content Area Simplificado */}
        <ScrollArea className="flex-grow bg-gradient-to-b from-gray-50/30 to-white">
          <div className="p-6"> 
            {!hasItems ? (
              <div className="flex flex-col items-center justify-center text-center h-[calc(90vh-200px)]">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">0</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Carrinho Vazio</h3>
                <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
                  Que tal adicionar alguns produtos incríveis ao seu carrinho? 
                  Temos ofertas especiais esperando por você!
                </p>
                <SheetClose asChild>
                  <Button
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-8 py-3 rounded-xl text-base shadow-lg transition-all duration-200"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Explorar Produtos
                  </Button>
                </SheetClose>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                <AnimatePresence mode="wait">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group relative bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100/50 shadow-sm transition-shadow duration-200 hover:shadow-md"
                    >
                      {/* Item Card Simplificado */}
                      <div className="flex items-start space-x-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-20 h-20 object-contain rounded-xl border border-gray-100 shadow-sm bg-white"
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-xs font-bold">{item.quantity}</span>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-gray-900 font-semibold text-base leading-tight mr-2 transition-colors duration-200 group-hover:text-red-600">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg w-8 h-8 flex items-center justify-center transition-all duration-200"
                              title="Remover item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {(item.size || item.color) && (
                            <div className="flex gap-2 mb-3">
                              {item.size && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                                  {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg font-medium">
                                  {item.color}
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center">
                            {/* Controles de Quantidade Simplificados */}
                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                                className={cn(
                                  "w-10 h-10 flex items-center justify-center text-gray-600 transition-colors duration-200 disabled:opacity-50",
                                  !isMobile && "hover:bg-red-50 hover:text-red-600"
                                )}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="w-12 h-10 flex items-center justify-center bg-white border-x border-gray-200">
                                <span className="text-gray-900 font-semibold text-sm">
                                  {item.quantity}
                                </span>
                              </div>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                                className={cn(
                                  "w-10 h-10 flex items-center justify-center text-gray-600 transition-colors duration-200",
                                  !isMobile && "hover:bg-green-50 hover:text-green-600"
                                )}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Preço Simplificado */}
                            <div className="text-right">
                              <p className="text-red-600 font-bold text-lg">
                                R$ {(item.product.price * item.quantity).toFixed(2)}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-gray-500 text-sm">
                                  R$ {item.product.price.toFixed(2)} cada
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Premium Simplificado */}
        {hasItems && (
          <SheetFooter className="border-t border-gray-100/80 p-6 bg-white/90 backdrop-blur-sm flex-shrink-0 flex-col sm:flex-col sm:justify-start sm:items-stretch space-y-4">
            {/* Summary Card Simplificado */}
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-2xl border border-gray-100/50 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Subtotal:</span>
                <span className="text-gray-900 font-semibold text-lg">
                  R$ {totalPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Frete:</span>
                <span className={cn(
                  "font-bold text-sm",
                  hasFreeShipping ? "text-green-600" : "text-red-600"
                )}>
                  {hasFreeShipping ? 'GRÁTIS' : 'Calcular'}
                </span>
              </div>
              
              {hasFreeShipping && (
                <div className="text-center py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <p className="text-green-700 text-sm font-semibold flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4" />
                    Parabéns! Você ganhou frete grátis!
                  </p>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-red-600">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Simplificados */}
            <div className="space-y-3">
              <Button
                onClick={sendToWhatsApp}
                className="w-full bg-gradient-to-r from-green-600 via-green-600 to-green-700 hover:from-green-700 hover:via-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all duration-200 text-base shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span>Finalizar no WhatsApp</span>
                  <div className="text-lg">📱</div>
                </div>
              </Button>

              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold py-4 rounded-xl transition-all duration-200 text-base"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Continuar Comprando
                </Button>
              </SheetClose>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2 leading-relaxed">
              🔒 Compra segura • Finalizamos pelo WhatsApp para melhor atendimento
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;

