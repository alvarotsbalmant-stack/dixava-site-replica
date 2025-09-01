import React from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';

interface WhatsAppLoadingOverlayProps {
  isVisible: boolean;
}

const WhatsAppLoadingOverlay: React.FC<WhatsAppLoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Ícone do WhatsApp animado */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
          </div>
        </div>

        {/* Texto de loading */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Redirecionando para WhatsApp
        </h3>
        <p className="text-gray-600 text-sm">
          Aguarde enquanto preparamos seu atendimento...
        </p>

        {/* Barra de progresso animada */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse" 
               style={{ 
                 width: '100%',
                 animation: 'loading-bar 2s ease-in-out infinite'
               }}>
          </div>
        </div>

        {/* Pontos de loading */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppLoadingOverlay;

