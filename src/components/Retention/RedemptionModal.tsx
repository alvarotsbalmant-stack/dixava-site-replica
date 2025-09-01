import React from 'react';
import { X, Copy, Mail, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  redemptionCode: string;
  productName: string;
  userEmail?: string;
}

export const RedemptionModal: React.FC<RedemptionModalProps> = ({
  isOpen,
  onClose,
  redemptionCode,
  productName,
  userEmail
}) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(redemptionCode);
    toast({ title: 'Copiado!', description: 'Código copiado para a área de transferência' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Store className="w-5 h-5" />
              Resgate Realizado!
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Sucesso */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-6xl mb-2">🎉</div>
            <h3 className="text-lg font-semibold text-green-800 mb-1">
              Parabéns!
            </h3>
            <p className="text-sm text-green-700">
              Você resgatou: <strong>{productName}</strong>
            </p>
          </div>

          {/* Código de Resgate */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Seu código de resgate:</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-100 rounded-lg border border-gray-300">
                <code className="text-2xl font-mono font-bold text-center block tracking-widest">
                  {redemptionCode}
                </code>
              </div>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="px-3"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Store className="w-4 h-4" />
              Como resgatar:
            </h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Vá até uma loja física UTI Games</li>
              <li>Apresente este código para um atendente</li>
              <li>Retire seu produto resgatado</li>
            </ol>
          </div>

          {/* Email Info */}
          {userEmail && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Este código também foi enviado para seu email: {userEmail}
              </p>
            </div>
          )}

          {/* Aviso Importante */}
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ Guarde este código com segurança! Ele é único e não pode ser recuperado.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => window.location.href = '/coins'}
              variant="outline"
              className="flex-1"
            >
              Ver Histórico
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Entendi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};