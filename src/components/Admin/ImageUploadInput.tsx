import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploadInputProps {
  label: string;
  currentImageUrl: string | undefined;
  onUploadComplete: (url: string) => void;
  folderName?: string; 
  requiredWidth?: number; 
  requiredHeight?: number; 
  tolerancePercent?: number; 
}

const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label,
  currentImageUrl,
  onUploadComplete,
  folderName = 'special_sections/banners',
  requiredWidth,
  requiredHeight,
  tolerancePercent = 5, 
}) => {
  const { uploadImage, uploading } = useImageUpload();
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Update preview when currentImageUrl changes (e.g., when form is reset or data is fetched)
  React.useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  const validateDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!requiredWidth || !requiredHeight) {
        resolve(true); 
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const { naturalWidth, naturalHeight } = img;
          
          const widthTolerance = requiredWidth * (tolerancePercent / 100);
          const heightTolerance = requiredHeight * (tolerancePercent / 100);
          
          const minWidth = requiredWidth - widthTolerance;
          const maxWidth = requiredWidth + widthTolerance;
          const minHeight = requiredHeight - heightTolerance;
          const maxHeight = requiredHeight + heightTolerance;
          
          const isWidthValid = naturalWidth >= minWidth && naturalWidth <= maxWidth;
          const isHeightValid = naturalHeight >= minHeight && naturalHeight <= maxHeight;
          
          if (isWidthValid && isHeightValid) {
            resolve(true);
          } else {
            // Use the correct required dimensions in the error message
            setErrorMessage(
              `Erro: A imagem deve ter aproximadamente ${requiredWidth}x${requiredHeight} pixels (tolerância de ${tolerancePercent}%). ` +
              `Sua imagem tem ${naturalWidth}x${naturalHeight} pixels.`
            );
            resolve(false);
          }
        };
        img.onerror = () => {
          setErrorMessage('Erro ao ler as dimensões da imagem.');
          resolve(false); 
        };
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
           setErrorMessage('Erro ao carregar a imagem para validação.');
           resolve(false);
        }
      };
      reader.onerror = () => {
        setErrorMessage('Erro ao ler o arquivo de imagem.');
        resolve(false);
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setErrorMessage(null); 

    if (fileRejections.length > 0) {
        const errors = fileRejections[0].errors.map(e => e.message).join(', ');
        setErrorMessage(`Erro no arquivo: ${errors}`);
        toast({ title: 'Arquivo inválido', description: errors, variant: 'destructive' });
        return;
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    const isValidDimensions = await validateDimensions(file);

    if (!isValidDimensions) {
      // Display the specific error message set by validateDimensions
      toast({ title: 'Dimensões Incorretas', description: errorMessage, variant: 'destructive', duration: 7000 });
      setPreview(null); 
      return; 
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl); 

    const publicUrl = await uploadImage(file, folderName);
    if (publicUrl) {
      onUploadComplete(publicUrl);
      setPreview(publicUrl); 
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); 
    } else {
      setPreview(currentImageUrl || null); 
      toast({ title: 'Falha no upload', description: 'Não foi possível carregar a imagem.', variant: 'destructive' });
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); 
    }
  }, [uploadImage, onUploadComplete, folderName, toast, currentImageUrl, requiredWidth, requiredHeight, tolerancePercent, errorMessage]); // Removed validateDimensions from dependency array as it's a stable function

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setPreview(null);
    setErrorMessage(null);
    onUploadComplete(''); 
  };

  // Prepare dimension display for label and dropzone text
  const dimensionText = requiredWidth && requiredHeight 
    ? `(${requiredWidth}x${requiredHeight}px)`
    : '';

  return (
    <div className="space-y-2">
      {/* Display dimensions in the main label */}
      <Label>{label}{dimensionText}</Label> 
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-600 hover:border-gray-500'}
                    ${preview ? 'border-solid border-gray-500' : ''}
                    ${errorMessage ? 'border-red-500 bg-red-50' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p>Enviando...</p>
          </div>
        ) : preview ? (
          <div className="relative group">
            <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={handleRemoveImage}
              aria-label="Remover imagem"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : errorMessage ? (
           <div className="flex flex-col items-center justify-center text-red-600">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">Erro na Imagem</p>
            <p className="text-xs">{errorMessage}</p>
            <p className="text-xs mt-2">Tente outra imagem ou clique para selecionar.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <UploadCloud className="h-8 w-8 mb-2" />
            {isDragActive ? (
              <p>Solte a imagem aqui...</p>
            ) : (
              <p>Arraste e solte uma imagem aqui, ou clique para selecionar</p>
            )}
            {/* Display dimensions in the dropzone hint text */}
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF, WEBP {dimensionText} 
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploadInput;


