import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, FileX, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SkippedProductLog } from './bulkEditUtils';

interface SkippedProductsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skippedLogs: SkippedProductLog[];
}

export const SkippedProductsModal: React.FC<SkippedProductsModalProps> = ({
  open,
  onOpenChange,
  skippedLogs
}) => {
  const { toast } = useToast();

  const copyLogsToClipboard = () => {
    const text = skippedLogs.map(log => 
      `SKU: ${log.sku_code} (Linha ${log.row})\nMotivo: ${log.reason}\nDetalhes: ${log.details || 'N/A'}\n`
    ).join('\n');
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Logs copiados!",
        description: "Os logs foram copiados para a área de transferência.",
      });
    });
  };

  const groupedLogs = skippedLogs.reduce((acc, log) => {
    if (!acc[log.reason]) {
      acc[log.reason] = [];
    }
    acc[log.reason].push(log);
    return acc;
  }, {} as Record<string, SkippedProductLog[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <FileX className="w-5 h-5 text-orange-400" />
            Produtos Ignorados - Log Detalhado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-orange-400 border-orange-400">
                {skippedLogs.length} produtos ignorados
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                {Object.keys(groupedLogs).length} tipos de problemas
              </Badge>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={copyLogsToClipboard}
              className="border-gray-600 hover:bg-gray-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Logs
            </Button>
          </div>

          <ScrollArea className="h-[50vh]">
            <div className="space-y-6 pr-4">
              {Object.entries(groupedLogs).map(([reason, logs]) => (
                <div key={reason} className="space-y-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    {reason}
                    <Badge variant="secondary" className="ml-2">
                      {logs.length} produto{logs.length > 1 ? 's' : ''}
                    </Badge>
                  </h3>

                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <Alert key={index} className="bg-gray-900 border-gray-600">
                        <Info className="h-4 w-4 text-blue-400" />
                        <AlertDescription className="text-gray-300">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <strong className="text-white">SKU:</strong>
                              <code className="bg-gray-700 px-2 py-1 rounded text-green-400">
                                {log.sku_code}
                              </code>
                              {log.row && (
                                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                                  Linha {log.row}
                                </Badge>
                              )}
                            </div>
                            
                            {log.details && (
                              <div className="text-gray-400 text-sm">
                                <strong>Detalhes:</strong> {log.details}
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Dicas de resolução */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Como resolver os problemas:
            </h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <strong>Produto não encontrado:</strong> Verifique se o código SKU está correto no banco de dados</li>
              <li>• <strong>Nenhum campo para atualizar:</strong> Preencha pelo menos um campo com dados válidos</li>
              <li>• <strong>Dados inválidos:</strong> Verifique formatos de números, booleanos e campos obrigatórios</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};