import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wand2, 
  Undo2, 
  Redo2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

interface MagicBrushEditorProps {
  originalImage: HTMLImageElement;
  processedImage: HTMLImageElement;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

export const MagicBrushEditor: React.FC<MagicBrushEditorProps> = ({
  originalImage,
  processedImage,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tolerance, setTolerance] = useState([30]);
  const [zoom, setZoom] = useState([100]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Configurar dimensões
    canvas.width = processedImage.naturalWidth;
    canvas.height = processedImage.naturalHeight;
    
    // Desenhar imagem processada como base
    ctx.drawImage(processedImage, 0, 0);
    
    // Salvar estado inicial
    saveToHistory();
  }, [processedImage]);
  
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      return newHistory.slice(-20); // Manter apenas 20 estados
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);
  
  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      setHistoryIndex(prev => prev - 1);
      ctx.putImageData(history[historyIndex - 1], 0, 0);
    }
  };
  
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      setHistoryIndex(prev => prev + 1);
      ctx.putImageData(history[historyIndex + 1], 0, 0);
    }
  };
  
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY)
    };
  };
  
  const getPixelColor = (imageData: ImageData, x: number, y: number) => {
    const index = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[index],
      g: imageData.data[index + 1],
      b: imageData.data[index + 2],
      a: imageData.data[index + 3]
    };
  };
  
  const colorDistance = (color1: any, color2: any) => {
    const dr = color1.r - color2.r;
    const dg = color1.g - color2.g;
    const db = color1.b - color2.b;
    const da = color1.a - color2.a;
    return Math.sqrt(dr * dr + dg * dg + db * db + da * da);
  };
  
  const floodFill = (imageData: ImageData, startX: number, startY: number, tolerance: number) => {
    const width = imageData.width;
    const height = imageData.height;
    const targetColor = getPixelColor(imageData, startX, startY);
    const visited = new Set<string>();
    const pixelsToRemove = new Set<string>();
    
    const queue = [{ x: startX, y: startY }];
    
    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      const key = `${x},${y}`;
      
      if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
        continue;
      }
      
      visited.add(key);
      const currentColor = getPixelColor(imageData, x, y);
      
      if (colorDistance(currentColor, targetColor) <= tolerance) {
        pixelsToRemove.add(key);
        
        // Adicionar pixels vizinhos à fila
        queue.push({ x: x + 1, y });
        queue.push({ x: x - 1, y });
        queue.push({ x, y: y + 1 });
        queue.push({ x, y: y - 1 });
      }
    }
    
    return pixelsToRemove;
  };
  
  const handleMagicClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    
    if (!canvas) {
      setIsProcessing(false);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }
    
    try {
      // Obter dados da imagem atual
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Executar flood fill para encontrar pixels similares
      const pixelsToRemove = floodFill(imageData, pos.x, pos.y, tolerance[0]);
      
      // Remover pixels encontrados (tornar transparentes)
      for (const pixelKey of pixelsToRemove) {
        const [x, y] = pixelKey.split(',').map(Number);
        const index = (y * imageData.width + x) * 4;
        imageData.data[index + 3] = 0; // Tornar transparente
      }
      
      // Aplicar as mudanças ao canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Salvar no histórico
      saveToHistory();
      
      console.log(`✨ Pincel mágico removeu ${pixelsToRemove.size} pixels`);
    } catch (error) {
      console.error('Erro no pincel mágico:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, 'image/png');
  };
  
  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(processedImage, 0, 0);
    
    saveToHistory();
  };
  
  const togglePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (showOriginal) {
      // Voltar para imagem editada (último estado do histórico)
      if (history.length > 0) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
    } else {
      // Mostrar original
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(originalImage, 0, 0);
    }
    
    setShowOriginal(!showOriginal);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">🪄 Pincel Mágico</h3>
            <p className="text-sm text-gray-600">Clique em áreas para remover automaticamente (bordas, fundos, etc.)</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0 || isProcessing}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1 || isProcessing}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isProcessing}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
            disabled={isProcessing}
          >
            {showOriginal ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showOriginal ? 'Editada' : 'Original'}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">Processando...</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Settings */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 min-w-[250px]">
          <label className="text-sm font-medium">Tolerância:</label>
          <Slider
            value={tolerance}
            onValueChange={setTolerance}
            max={100}
            min={5}
            step={5}
            className="flex-1"
            disabled={isProcessing}
          />
          <Badge variant="outline" className="min-w-[3rem] text-center">
            {tolerance[0]}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm font-medium">Zoom:</label>
          <Slider
            value={zoom}
            onValueChange={setZoom}
            max={500}
            min={25}
            step={25}
            className="flex-1"
          />
          <Badge variant="outline" className="min-w-[3rem] text-center">
            {zoom[0]}%
          </Badge>
        </div>
        
        <div className="text-xs text-gray-500">
          💡 <strong>Dica:</strong> Ajuste a tolerância para controlar a sensibilidade da seleção
        </div>
      </div>
      
      {/* Canvas */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-4 h-full">
          <div 
            className="relative w-full h-full overflow-auto bg-gray-100 rounded-lg"
            style={{
              backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            <canvas
              ref={canvasRef}
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border shadow-lg ${
                isProcessing ? 'cursor-wait' : 'cursor-crosshair hover:cursor-pointer'
              }`}
              style={{
                transform: `translate(-50%, -50%) scale(${zoom[0] / 100})`,
              }}
              onClick={!showOriginal ? handleMagicClick : undefined}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <Badge variant="secondary" className="mr-2">
            🪄 Pincel Mágico
          </Badge>
          Clique em bordas pretas, fundos brancos ou qualquer área para remover
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isProcessing}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Salvar Resultado
          </Button>
        </div>
      </div>
    </div>
  );
};