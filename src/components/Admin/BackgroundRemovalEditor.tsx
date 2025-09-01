import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brush, 
  Eraser, 
  Undo2, 
  Redo2, 
  Download, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut,
  Move,
  Eye,
  EyeOff
} from 'lucide-react';

interface BackgroundRemovalEditorProps {
  originalImage: HTMLImageElement;
  processedImage: HTMLImageElement;
  onSave: (editedImageBlob: Blob) => void;
  onCancel: () => void;
}

type Tool = 'brush' | 'eraser' | 'move';

export const BackgroundRemovalEditor: React.FC<BackgroundRemovalEditorProps> = ({
  originalImage,
  processedImage,
  onSave,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  const [brushSize, setBrushSize] = useState([20]);
  const [zoom, setZoom] = useState([100]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!ctx || !maskCtx) return;
    
    // Configurar dimensões
    canvas.width = processedImage.naturalWidth;
    canvas.height = processedImage.naturalHeight;
    maskCanvas.width = processedImage.naturalWidth;
    maskCanvas.height = processedImage.naturalHeight;
    
    // Desenhar imagem processada
    ctx.drawImage(processedImage, 0, 0);
    
    // Criar máscara inicial baseada na transparência (com proteção CORS)
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
      
      const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const alpha = imageData.data[i + 3];
        const maskValue = alpha > 128 ? 255 : 0;
        
        maskImageData.data[i] = maskValue;     // R
        maskImageData.data[i + 1] = maskValue; // G
        maskImageData.data[i + 2] = maskValue; // B
        maskImageData.data[i + 3] = 255;       // A
      }
      
      maskCtx.putImageData(maskImageData, 0, 0);
    } catch (error) {
      console.warn('CORS error detectado, usando máscara padrão:', error);
      // Fallback: criar máscara branca simples
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
    
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
      updateMaskFromCanvas();
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
      updateMaskFromCanvas();
    }
  };
  
  const updateMaskFromCanvas = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!ctx || !maskCtx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const alpha = imageData.data[i + 3];
      const maskValue = alpha > 128 ? 255 : 0;
      
      maskImageData.data[i] = maskValue;
      maskImageData.data[i + 1] = maskValue;
      maskImageData.data[i + 2] = maskValue;
    }
    
    maskCtx.putImageData(maskImageData, 0, 0);
  };
  
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'move') return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!ctx || !maskCtx) return;
    
    // Configurar pincel
    ctx.globalCompositeOperation = currentTool === 'brush' ? 'source-over' : 'destination-out';
    maskCtx.globalCompositeOperation = currentTool === 'brush' ? 'source-over' : 'destination-out';
    
    ctx.lineWidth = brushSize[0];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    maskCtx.lineWidth = brushSize[0];
    maskCtx.lineCap = 'round';
    maskCtx.lineJoin = 'round';
    
    if (currentTool === 'brush') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
      maskCtx.strokeStyle = 'white';
    }
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    maskCtx.beginPath();
    maskCtx.moveTo(pos.x, pos.y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool === 'move') return;
    
    const pos = getMousePos(e);
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!ctx || !maskCtx) return;
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    maskCtx.lineTo(pos.x, pos.y);
    maskCtx.stroke();
    
    // Atualizar transparência em tempo real
    if (currentTool === 'brush') {
      // Restaurar pixels da imagem original
      const originalCtx = document.createElement('canvas').getContext('2d');
      if (originalCtx) {
        originalCtx.canvas.width = originalImage.naturalWidth;
        originalCtx.canvas.height = originalImage.naturalHeight;
        originalCtx.drawImage(originalImage, 0, 0);
        
        const imageData = ctx.getImageData(pos.x - brushSize[0]/2, pos.y - brushSize[0]/2, brushSize[0], brushSize[0]);
        const originalData = originalCtx.getImageData(pos.x - brushSize[0]/2, pos.y - brushSize[0]/2, brushSize[0], brushSize[0]);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (imageData.data[i + 3] > 0) {
            imageData.data[i] = originalData.data[i];
            imageData.data[i + 1] = originalData.data[i + 1];
            imageData.data[i + 2] = originalData.data[i + 2];
            imageData.data[i + 3] = 255;
          }
        }
        
        ctx.putImageData(imageData, pos.x - brushSize[0]/2, pos.y - brushSize[0]/2);
      }
    }
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };
  
  const applyMaskToCanvas = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!ctx || !maskCtx) return;
    
    // Desenhar imagem original
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0);
    
    // Aplicar máscara
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const maskValue = maskData.data[i];
      imageData.data[i + 3] = maskValue;
    }
    
    ctx.putImageData(imageData, 0, 0);
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    applyMaskToCanvas();
    
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
    
    updateMaskFromCanvas();
    saveToHistory();
  };
  
  const togglePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (showOriginal) {
      applyMaskToCanvas();
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(originalImage, 0, 0);
    }
    
    setShowOriginal(!showOriginal);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            variant={currentTool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('brush')}
          >
            <Brush className="w-4 h-4 mr-1" />
            Pincel
          </Button>
          
          <Button
            variant={currentTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('eraser')}
          >
            <Eraser className="w-4 h-4 mr-1" />
            Borracha
          </Button>
          
          <Button
            variant={currentTool === 'move' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTool('move')}
          >
            <Move className="w-4 h-4 mr-1" />
            Mover
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo2 className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
          >
            {showOriginal ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showOriginal ? 'Ocultar' : 'Original'}
          </Button>
        </div>
      </div>
      
      {/* Settings */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 min-w-[200px]">
          <label className="text-sm font-medium">Tamanho:</label>
          <Slider
            value={brushSize}
            onValueChange={setBrushSize}
            max={100}
            min={1}
            step={1}
            className="flex-1"
          />
          <Badge variant="outline" className="min-w-[3rem] text-center">
            {brushSize[0]}px
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
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border shadow-lg cursor-crosshair"
              style={{
                transform: `translate(-50%, -50%) scale(${zoom[0] / 100})`,
                cursor: currentTool === 'move' ? 'move' : currentTool === 'brush' ? 'crosshair' : 'not-allowed'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {/* Canvas invisível para máscara */}
            <canvas
              ref={maskCanvasRef}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <Badge variant="secondary" className="mr-2">
            {currentTool === 'brush' ? '🖌️ Pincel' : currentTool === 'eraser' ? '🧽 Borracha' : '🤏 Mover'}
          </Badge>
          Use o pincel para restaurar áreas e a borracha para remover
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            Salvar Edição
          </Button>
        </div>
      </div>
    </div>
  );
};