import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, LogIn, UserPlus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
  feature?: string;
}

export const AuthRequiredModal = ({ 
  isOpen, 
  onClose, 
  onLoginClick,
  feature = "favoritos" 
}: AuthRequiredModalProps) => {
  
  const handleLoginClick = () => {
    onClose();
    onLoginClick();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/60 backdrop-blur-md" />
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-sm w-full mx-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Header com botão de fechar */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-8 text-center">
            {/* Ícone */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Título */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Login Necessário
            </h2>

            {/* Descrição */}
            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              Para acessar seus {feature}, você precisa estar logado em sua conta.
            </p>

            {/* Botões */}
            <div className="space-y-3">
              <Button
                onClick={handleLoginClick}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Fazer Login
              </Button>

              <Button
                variant="outline"
                onClick={handleLoginClick}
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-xl transition-all duration-200"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Conta
              </Button>
            </div>

            {/* Texto adicional */}
            <p className="text-xs text-gray-500 mt-6">
              É rápido e gratuito! ✨
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};