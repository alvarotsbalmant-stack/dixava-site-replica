
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, Trash2, Loader2, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageDropZoneProps {
  onDrop: (imageUrl: string) => void;
  onFileUpload: (files: FileList | null) => void;
  onRemove?: () => void;
  currentImage?: string;
  placeholder?: string;
  compact?: boolean;
  className?: string;
  uploading?: boolean;
}

const ImageDropZone: React.FC<ImageDropZoneProps> = ({
  onDrop,
  onFileUpload,
  onRemove,
  currentImage,
  placeholder = "Arraste uma imagem aqui",
  compact = false,
  className,
  uploading = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!uploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (uploading) return;

    const files = e.dataTransfer.files;
    const imageUrl = e.dataTransfer.getData('text/plain');

    if (imageUrl && imageUrl.startsWith('http')) {
      // Validar se é uma URL de imagem
      if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || imageUrl.includes('supabase') || imageUrl.includes('imgur')) {
        onDrop(imageUrl);
      } else {
        console.warn('URL não parece ser uma imagem válida:', imageUrl);
      }
    } else if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileUpload(files);
      } else {
        console.warn('Arquivo não é uma imagem:', file.type);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploading) return;
    
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileUpload(files);
      } else {
        alert('Por favor, selecione apenas arquivos de imagem');
      }
    }
    
    // Limpar o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleClick = () => {
    if (!currentImage && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const hasValidImage = currentImage && currentImage.trim() !== '' && !imageError;

  return (
    <div className={cn("relative", className)}>
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200",
          compact ? "h-24" : "h-32",
          isDragOver && !uploading ? "border-blue-500 bg-blue-50" : "border-gray-300",
          hasValidImage ? "border-solid bg-white" : "",
          uploading ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:border-gray-400",
          !hasValidImage && !uploading ? "hover:bg-gray-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs text-gray-500">Enviando...</span>
            </div>
          ) : hasValidImage ? (
            <div className="relative w-full h-full group">
              <img
                src={currentImage}
                alt="Preview"
                className="w-full h-full object-cover rounded"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              {onRemove && (
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center rounded">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : imageError ? (
            <div className="flex flex-col items-center gap-2 text-red-500">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-xs text-center">Erro ao carregar imagem</span>
              {onRemove && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="text-xs"
                >
                  Remover
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              {compact ? (
                <Plus className="w-6 h-6" />
              ) : (
                <>
                  <Upload className="w-8 h-8" />
                  <span className="text-sm text-center px-2">{placeholder}</span>
                  <span className="text-xs text-gray-400">ou clique para selecionar</span>
                </>
              )}
            </div>
          )}
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default ImageDropZone;
