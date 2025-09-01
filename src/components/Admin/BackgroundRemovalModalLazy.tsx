import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Palette, Zap, Hand, CheckCircle, XCircle, Loader2, Settings } from 'lucide-react';
import { useBackgroundRemovalLazy } from '@/hooks/useBackgroundRemovalLazy';
import { MagicBrushEditor } from './MagicBrushEditor';
import { LazyBackgroundRemoval } from './LazyAdminFeatures';

interface BackgroundRemovalModalLazyProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
  onSuccess: (processedImageUrl: string) => void;
}

type Step = 'preview' | 'settings' | 'processing' | 'result' | 'editor';

export const BackgroundRemovalModalLazy: React.FC<BackgroundRemovalModalLazyProps> = ({
  isOpen,
  onClose,
  imageUrl,
  productName,
  onSuccess
}) => {
  const { processImageFromUrl, processMagicBrushEdit, processing, progress } = useBackgroundRemovalLazy();
  const [step, setStep] = useState<Step>('preview');
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [originalImageElement, setOriginalImageElement] = useState<HTMLImageElement | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string>('');
  
  // Settings state
  const [quality, setQuality] = useState<'fast' | 'balanced' | 'high'>('balanced');
  const [model, setModel] = useState<'general' | 'portrait' | 'object' | 'product' | 'auto'>('auto');
  const [smoothEdges, setSmoothEdges] = useState(true);
  const [threshold, setThreshold] = useState([0.5]);

  useEffect(() => {
    if (!isOpen) {
      setStep('preview');
      setProcessedImageUrl('');
      setOriginalImageElement(null);
      setProcessedBlob(null);
      setEditedImageUrl('');
    }
  }, [isOpen]);

  const handleProcessImage = async (backgroundRemovalModule: any) => {
    if (!backgroundRemovalModule) return;
    
    setStep('processing');
    
    try {
      const result = await processImageFromUrl(imageUrl, backgroundRemovalModule, {
        quality,
        model,
        smoothEdges,
        threshold: threshold[0]
      });
      
      if (result) {
        setProcessedImageUrl(result.url);
        setOriginalImageElement(result.originalImage);
        setProcessedBlob(result.processedBlob);
        setStep('result');
      } else {
        setStep('preview');
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      setStep('preview');
    }
  };

  const handleEditWithBrush = async () => {
    if (originalImageElement && processedBlob) {
      // Converter blob para URL temporária para o editor
      const processedUrl = URL.createObjectURL(processedBlob);
      setEditedImageUrl(processedUrl);
      setStep('editor');
    }
  };

  const handleSaveEdit = async (editedBlob: Blob) => {
    setStep('processing');
    
    try {
      const result = await processMagicBrushEdit(editedBlob);
      
      if (result) {
        setProcessedImageUrl(result);
        setStep('result');
      } else {
        setStep('editor');
      }
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
      setStep('editor');
    }
  };

  const handleFinish = () => {
    if (processedImageUrl) {
      onSuccess(processedImageUrl);
      onClose();
    }
  };

  const renderStepContent = (backgroundRemovalModule: any, loadingModule: boolean) => {
    if (loadingModule) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Carregando ferramenta de IA...</p>
        </div>
      );
    }

    if (!backgroundRemovalModule) {
      return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <XCircle className="w-8 h-8 text-red-500" />
          <p className="text-gray-600">Erro ao carregar ferramenta de IA</p>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      );
    }

    switch (step) {
      case 'preview':
        return (
          <div className="space-y-6">
            <div className="flex justify-center">
              <img 
                src={imageUrl} 
                alt={productName}
                className="max-w-full max-h-64 object-contain rounded-lg border"
              />
            </div>
            
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Remover Fundo da Imagem</h3>
              <p className="text-gray-600">
                Use nossa IA avançada para remover automaticamente o fundo desta imagem.
              </p>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => setStep('settings')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </Button>
                
                <Button 
                  onClick={() => handleProcessImage(backgroundRemovalModule)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Zap className="w-4 h-4" />
                  <span>Processar Agora</span>
                </Button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Configurações de Processamento</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Qualidade</label>
                <div className="flex space-x-2">
                  {(['fast', 'balanced', 'high'] as const).map((q) => (
                    <Button
                      key={q}
                      variant={quality === q ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQuality(q)}
                    >
                      {q === 'fast' ? 'Rápido' : q === 'balanced' ? 'Balanceado' : 'Alta'}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Modelo de IA</label>
                <div className="flex flex-wrap gap-2">
                  {(['auto', 'general', 'portrait', 'object', 'product'] as const).map((m) => (
                    <Button
                      key={m}
                      variant={model === m ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setModel(m)}
                    >
                      {m === 'auto' ? 'Automático' : 
                       m === 'general' ? 'Geral' :
                       m === 'portrait' ? 'Retrato' :
                       m === 'object' ? 'Objeto' : 'Produto'}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Suavizar Bordas: {smoothEdges ? 'Ativado' : 'Desativado'}
                </label>
                <Button
                  variant={smoothEdges ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSmoothEdges(!smoothEdges)}
                >
                  {smoothEdges ? 'Desativar' : 'Ativar'}
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sensibilidade: {(threshold[0] * 100).toFixed(0)}%
                </label>
                <Slider
                  value={threshold}
                  onValueChange={setThreshold}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('preview')}>
                Voltar
              </Button>
              <Button onClick={() => handleProcessImage(backgroundRemovalModule)}>
                Processar
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <h3 className="text-lg font-semibold">Processando Imagem</h3>
            <p className="text-gray-600 text-center">
              Nossa IA está removendo o fundo da sua imagem...
            </p>
            <div className="w-full max-w-xs">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1 text-center">{progress}%</p>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Resultado</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-2">Original</h4>
                  <img 
                    src={imageUrl} 
                    alt="Original"
                    className="w-full h-32 object-contain rounded border"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium mb-2">Processada</h4>
                  <img 
                    src={processedImageUrl} 
                    alt="Processada"
                    className="w-full h-32 object-contain rounded border bg-gray-100"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline"
                onClick={handleEditWithBrush}
                className="flex items-center space-x-2"
              >
                <Palette className="w-4 h-4" />
                <span>Editar com Pincel</span>
              </Button>
              
              <Button 
                onClick={handleFinish}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalizar</span>
              </Button>
            </div>
          </div>
        );

      case 'editor':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Editor de Pincel Mágico</h3>
            {originalImageElement && editedImageUrl && (
              <MagicBrushEditor
                originalImage={originalImageElement}
                processedImage={originalImageElement} // Será substituído pelo componente
                onSave={handleSaveEdit}
                onCancel={() => setStep('result')}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <span>Remoção de Fundo - {productName}</span>
            {processing && <Badge variant="secondary">Processando...</Badge>}
          </DialogTitle>
        </DialogHeader>
        
        <LazyBackgroundRemoval>
          {(backgroundRemovalModule, loadingModule) => renderStepContent(backgroundRemovalModule, loadingModule)}
        </LazyBackgroundRemoval>
      </DialogContent>
    </Dialog>
  );
};