import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Palette, Zap, Hand, CheckCircle, XCircle, Loader2, Settings } from 'lucide-react';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';
import { MagicBrushEditor } from './MagicBrushEditor';
import { loadImageFromUrl, convertImageToBlobUrl } from '@/utils/backgroundRemoval';

interface BackgroundRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
  onSuccess: (processedImageUrl: string) => void;
}

type Step = 'preview' | 'settings' | 'processing' | 'result' | 'editor';

export const BackgroundRemovalModal: React.FC<BackgroundRemovalModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  productName,
  onSuccess
}) => {
  const { processImageFromUrl, processMagicBrushEdit, processing, progress } = useBackgroundRemoval();
  const [step, setStep] = useState<Step>('preview');
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [processedImage, setProcessedImage] = useState<HTMLImageElement | null>(null);
  
  // Configurações avançadas
  const [model, setModel] = useState<'auto' | 'general' | 'portrait' | 'object' | 'product'>('auto');
  const [quality, setQuality] = useState<'fast' | 'balanced' | 'high'>('balanced');
  const [smoothEdges, setSmoothEdges] = useState(true);
  const [threshold, setThreshold] = useState([128]);

  useEffect(() => {
    if (isOpen) {
      setStep('preview');
      setProcessedImageUrl('');
      setOriginalImage(null);
      setProcessedImage(null);
    }
  }, [isOpen]);

  const handleAutoProcess = async () => {
    setStep('processing');
    
    try {
      const options = {
        model,
        quality,
        smoothEdges,
        threshold: threshold[0]
      };
      
      const result = await processImageFromUrl(imageUrl, options);
      
      if (result) {
        setProcessedImageUrl(result.url);
        
        // Converter imagem original para blob URL seguro
        const safeOriginalImage = await convertImageToBlobUrl(result.originalImage);
        setOriginalImage(safeOriginalImage);
        
        // Carregar e converter imagem processada para blob URL seguro
        const processedImg = new Image();
        processedImg.onload = async () => {
          try {
            // Converter a imagem processada para blob URL seguro
            const response = await fetch(result.url);
            const blob = await response.blob();
            const safeBlobUrl = URL.createObjectURL(blob);
            
            const safeProcessedImg = new Image();
            safeProcessedImg.onload = () => {
              setProcessedImage(safeProcessedImg);
              setStep('result');
            };
            safeProcessedImg.onerror = () => {
              console.error('Erro ao carregar imagem processada segura');
              // Fallback: usar imagem original
              setProcessedImage(processedImg);
              setStep('result');
            };
            safeProcessedImg.src = safeBlobUrl;
          } catch (error) {
            console.error('Erro ao converter imagem processada:', error);
            // Fallback: usar imagem original sem conversão
            setProcessedImage(processedImg);
            setStep('result');
          }
        };
        processedImg.src = result.url;
      } else {
        setStep('preview');
      }
    } catch (error) {
      console.error('Erro no processamento:', error);
      setStep('preview');
    }
  };

  const handleMagicBrush = () => {
    if (originalImage && processedImage) {
      setStep('editor');
    }
  };

  const handleEditorSave = async (editedBlob: Blob) => {
    const result = await processMagicBrushEdit(editedBlob);
    if (result) {
      onSuccess(result);
      onClose();
    }
  };

  const handleEditorCancel = () => {
    setStep('result');
  };

  const handleApply = () => {
    if (processedImageUrl) {
      onSuccess(processedImageUrl);
      onClose();
    }
  };

  const handleCancel = () => {
    setStep('preview');
    setProcessedImageUrl('');
    onClose();
  };

  if (step === 'editor' && originalImage && processedImage) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              Pincel Mágico - {productName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="h-[80vh]">
            <MagicBrushEditor
              originalImage={originalImage}
              processedImage={processedImage}
              onSave={handleEditorSave}
              onCancel={handleEditorCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            Sistema Avançado de Remoção de Fundo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div>
              <h3 className="font-medium text-gray-900">{productName}</h3>
              <p className="text-sm text-gray-600">Sistema IA avançado com pincel mágico</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={step === 'result' ? 'default' : 'secondary'}>
                {step === 'preview' && '🎯 Configurar'}
                {step === 'settings' && '⚙️ Ajustes'}
                {step === 'processing' && '🤖 Processando'}
                {step === 'result' && '✅ Concluído'}
              </Badge>
              {processing && (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Imagem Original */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="w-full max-w-sm mx-auto">
                        <img
                          src={imageUrl}
                          alt={productName}
                          className="w-full h-auto rounded-lg border shadow-sm"
                          style={{ maxHeight: '250px', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">📷 Imagem Original</h4>
                        <p className="text-sm text-gray-600">Box art atual com fundo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Configurações */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configurações IA
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Tipo de Conteúdo</label>
                        <Select value={model} onValueChange={(value: any) => setModel(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">🤖 Detecção Automática</SelectItem>
                            <SelectItem value="product">🎮 Produto/Box Art (Recomendado)</SelectItem>
                            <SelectItem value="object">📦 Objeto Geral</SelectItem>
                            <SelectItem value="portrait">👤 Retrato/Pessoa</SelectItem>
                            <SelectItem value="general">🔄 Uso Geral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Qualidade</label>
                        <Select value={quality} onValueChange={(value: any) => setQuality(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar qualidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fast">⚡ Rápido (CPU)</SelectItem>
                            <SelectItem value="balanced">⚖️ Balanceado</SelectItem>
                            <SelectItem value="high">💎 Alta Qualidade</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Threshold: {threshold[0]}
                        </label>
                        <Slider
                          value={threshold}
                          onValueChange={setThreshold}
                          max={255}
                          min={50}
                          step={5}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Controla a sensibilidade da transparência
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="smoothEdges"
                          checked={smoothEdges}
                          onChange={(e) => setSmoothEdges(e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="smoothEdges" className="text-sm font-medium">
                          ✨ Suavizar bordas
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleAutoProcess}
                  disabled={processing}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Processar com IA
                </Button>
                
                <Button
                  onClick={() => {
                    // Carregar imagem original e ir direto para o editor
                    loadImageFromUrl(imageUrl).then((img) => {
                      setOriginalImage(img);
                      setProcessedImage(img); // Usar a mesma imagem como base
                      setStep('editor');
                    }).catch((error) => {
                      console.error('Erro ao carregar imagem para pincel mágico:', error);
                    });
                  }}
                  disabled={processing}
                  size="lg"
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 px-8"
                >
                  <Hand className="w-5 h-5 mr-2" />
                  🪄 PINCEL MÁGICO
                </Button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <div className="relative">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Palette className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-xl font-medium text-gray-900">
                        🤖 IA Processando Imagem
                      </h4>
                      <p className="text-gray-600">
                        Modelo {model} • Qualidade {quality} • {smoothEdges ? 'Com' : 'Sem'} suavização
                      </p>
                    </div>

                    <div className="w-full max-w-lg mx-auto space-y-3">
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm font-medium text-gray-700">{Math.round(progress)}% concluído</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 max-w-md mx-auto">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          📷
                        </div>
                        <p>Carregando imagem</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          🧠
                        </div>
                        <p>Detectando objeto</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          ✂️
                        </div>
                        <p>Removendo fundo</p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          ✨
                        </div>
                        <p>Otimizando resultado</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Result Step */}
          {step === 'result' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original */}
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <img
                        src={imageUrl}
                        alt="Original"
                        className="w-full h-auto rounded-lg border shadow-sm"
                        style={{ maxHeight: '250px', objectFit: 'contain' }}
                      />
                      <h4 className="font-medium text-gray-700">📷 Original</h4>
                    </div>
                  </CardContent>
                </Card>

                {/* Processed */}
                <Card className="ring-2 ring-green-400 shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div 
                        className="w-full rounded-lg border-2 border-dashed border-green-300"
                        style={{ 
                          minHeight: '250px',
                          background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                          backgroundSize: '20px 20px',
                          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                        }}
                      >
                        <img
                          src={processedImageUrl}
                          alt="Sem Fundo"
                          className="w-full h-auto rounded-lg"
                          style={{ maxHeight: '250px', objectFit: 'contain' }}
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-700">✨ Processado</h4>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 text-green-800 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-lg">Processamento Concluído!</span>
                    <p className="text-sm text-green-700">
                      Fundo removido usando modelo {model} com qualidade {quality}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-xs font-medium text-gray-600">Precisão Alta</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-xs font-medium text-gray-600">Processamento {quality}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-2xl mb-1">✨</div>
                    <div className="text-xs font-medium text-gray-600">{smoothEdges ? 'Bordas Suaves' : 'Bordas Nítidas'}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleApply}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Aplicar Resultado
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleMagicBrush}
                  className="px-6 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <Hand className="w-4 h-4 mr-2" />
                  🪄 Pincel Mágico
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => setStep('preview')}
                  className="px-6"
                >
                  🔄 Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Sistema IA v2.0 • Pincel Mágico • Múltiplos Modelos</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={processing}
              className="text-gray-600 hover:text-gray-800"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};