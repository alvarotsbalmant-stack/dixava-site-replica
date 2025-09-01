
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Trash2, Plus, Upload, Link, Image, AlertCircle, Loader2, Clock, Palette } from 'lucide-react';
import { Product } from '@/hooks/useProducts/types';
import { ProductWithChanges } from '@/hooks/useLocalImageChanges';
import ImageDropZone from './ImageDropZone';
import { BackgroundRemovalModal } from '@/components/Admin/BackgroundRemovalModal';

interface ProductImageCardProps {
  product: ProductWithChanges;
  onImageDrop: (productId: string, imageUrl: string, isMainImage?: boolean) => void;
  onRemoveImage: (productId: string, imageUrl: string, isMainImage?: boolean) => void;
  onFileUpload: (files: FileList | null, productId?: string, isMainImage?: boolean) => void;
  onUrlAdd: (productId: string, url: string, isMainImage?: boolean) => void;
  isSelected: boolean;
  onToggleSelection: () => void;
  uploading: boolean;
  hasLocalChanges?: boolean;
}

const ProductImageCard: React.FC<ProductImageCardProps> = ({
  product,
  onImageDrop,
  onRemoveImage,
  onFileUpload,
  onUrlAdd,
  isSelected,
  onToggleSelection,
  uploading,
  hasLocalChanges = false
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);

  const handleUrlSubmit = async (isMainImage: boolean = false) => {
    const url = newImageUrl.trim();
    
    if (!url) {
      setUrlError('URL é obrigatória');
      return;
    }

    // Validar URL
    try {
      new URL(url);
    } catch {
      setUrlError('URL inválida');
      return;
    }

    // Verificar se é uma URL de imagem válida
    if (!url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) && !url.includes('supabase') && !url.includes('imgur') && !url.includes('cloudinary')) {
      setUrlError('URL deve apontar para uma imagem válida');
      return;
    }

    setUrlError('');
    await onUrlAdd(product.id, url, isMainImage);
    setNewImageUrl('');
    setShowUrlInput(false);
  };

  const handleUrlChange = (value: string) => {
    setNewImageUrl(value);
    if (urlError) setUrlError('');
  };

  const handleRemoveImageSafe = (imageUrl: string, isMainImage: boolean) => {
    if (!imageUrl) {
      console.warn('Tentativa de remover imagem sem URL');
      return;
    }
    
    console.log('Removendo imagem segura:', { productId: product.id, imageUrl, isMainImage });
    onRemoveImage(product.id, imageUrl, isMainImage);
  };

  const handleBackgroundRemovalSuccess = (processedImageUrl: string) => {
    // Adicionar a imagem processada como principal
    onImageDrop(product.id, processedImageUrl, true);
    setShowBackgroundModal(false);
  };

  const additionalImages = Array.isArray(product.additional_images) ? product.additional_images : [];
  
  // Função segura para truncar IDs
  const truncateId = (id: string) => {
    if (!id || typeof id !== 'string') return 'N/A';
    return id.length > 8 ? `${id.slice(0, 8)}...` : id;
  };

  const hasMainImage = product.image && product.image.trim() !== '';

  return (
    <Card className={`transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
    } ${uploading ? 'opacity-75' : ''} ${
      hasLocalChanges ? 'ring-2 ring-amber-400 bg-amber-50' : ''
    }`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                {product.name || 'Produto sem nome'}
              </CardTitle>
              {hasLocalChanges && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Pendente
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">ID: {truncateId(product.id)}</p>
            {product.price && (
              <p className="text-xs text-green-600 font-medium">
                R$ {Number(product.price).toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {uploading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelection}
              disabled={uploading}
            />
          </div>
        </div>
        
        {hasLocalChanges && (
          <div className="mt-2 p-2 bg-amber-100 rounded-md">
            <p className="text-xs text-amber-800">
              ⚡ Este produto possui alterações não salvas
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Imagem Principal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Imagem Principal</span>
            {hasMainImage && (
              <Badge variant="outline" className="text-xs">
                Definida
              </Badge>
            )}
          </div>
          
          <ImageDropZone
            onDrop={(imageUrl) => onImageDrop(product.id, imageUrl, true)}
            onFileUpload={(files) => onFileUpload(files, product.id, true)}
            currentImage={hasMainImage ? product.image : undefined}
            onRemove={hasMainImage ? () => handleRemoveImageSafe(product.image!, true) : undefined}
            placeholder="Arraste a imagem principal aqui"
            uploading={uploading}
          />
          
          <div className="space-y-2">
            {!showUrlInput ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUrlInput(true)}
                  className="flex-1"
                  disabled={uploading}
                >
                  <Link className="w-4 h-4 mr-2" />
                  Adicionar por URL
                </Button>
                
                {hasMainImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBackgroundModal(true)}
                    className="flex-1 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:border-purple-300 text-purple-700"
                    disabled={uploading}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Remover Fundo
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Cole a URL da imagem..."
                      value={newImageUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit(true)}
                      disabled={uploading}
                      className={urlError ? 'border-red-500' : ''}
                    />
                    {urlError && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {urlError}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUrlSubmit(true)}
                    disabled={!newImageUrl.trim() || uploading || !!urlError}
                  >
                    OK
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowUrlInput(false);
                      setNewImageUrl('');
                      setUrlError('');
                    }}
                    disabled={uploading}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Imagens Secundárias */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Imagens Secundárias</span>
            <Badge variant="outline" className="text-xs">
              {additionalImages.length}
            </Badge>
          </div>

          {/* Grid de imagens secundárias */}
          <div className="grid grid-cols-2 gap-2">
            {additionalImages.map((imageUrl, index) => (
              <div key={`${product.id}-${index}-${imageUrl}`} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Erro ao carregar imagem:', imageUrl);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImageSafe(imageUrl, false)}
                      disabled={uploading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Drop zone para nova imagem secundária */}
            <ImageDropZone
              onDrop={(imageUrl) => onImageDrop(product.id, imageUrl, false)}
              onFileUpload={(files) => onFileUpload(files, product.id, false)}
              placeholder="+"
              compact
              className="aspect-square"
              uploading={uploading}
            />
          </div>

          {/* Botão para adicionar por URL - Secundárias */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = prompt('Cole a URL da imagem:');
              if (url && url.trim()) {
                try {
                  new URL(url.trim());
                  onUrlAdd(product.id, url.trim(), false);
                } catch {
                  alert('URL inválida');
                }
              }
            }}
            className="w-full text-xs"
            disabled={uploading}
          >
            <Link className="w-3 h-3 mr-1" />
            Adicionar por URL
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>R$ {(product.price || 0).toFixed(2)}</span>
            <div className="flex items-center gap-2">
              <span>{product.is_active !== false ? 'Ativo' : 'Inativo'}</span>
              {hasMainImage && (
                <Badge variant="secondary" className="text-xs">
                  ✓ Principal
                </Badge>
              )}
              {additionalImages.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{additionalImages.length}
                </Badge>
              )}
              {hasLocalChanges && (
                <Badge variant="secondary" className="text-xs bg-amber-200 text-amber-800">
                  Pendente
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Remoção de Fundo */}
        {hasMainImage && (
          <BackgroundRemovalModal
            isOpen={showBackgroundModal}
            onClose={() => setShowBackgroundModal(false)}
            imageUrl={product.image!}
            productName={product.name || 'Produto'}
            onSuccess={handleBackgroundRemovalSuccess}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProductImageCard;
