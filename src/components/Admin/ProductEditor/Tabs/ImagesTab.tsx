import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, Image, Upload } from 'lucide-react';
import { ProductEditorData } from '../ProductEditor';

interface ImagesTabProps {
  formData: ProductEditorData;
  onChange: (field: string, value: any) => void;
}

const ImagesTab: React.FC<ImagesTabProps> = ({ formData, onChange }) => {
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleMainImageChange = (url: string) => {
    onChange('image', url);
  };

  const handleAddAdditionalImage = () => {
    if (newImageUrl.trim()) {
      const currentImages = formData.additional_images || [];
      onChange('additional_images', [...currentImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveAdditionalImage = (index: number) => {
    const currentImages = formData.additional_images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    onChange('additional_images', newImages);
  };

  const handleMoveImageUp = (index: number) => {
    const currentImages = [...(formData.additional_images || [])];
    if (index > 0) {
      [currentImages[index], currentImages[index - 1]] = [currentImages[index - 1], currentImages[index]];
      onChange('additional_images', currentImages);
    }
  };

  const handleMoveImageDown = (index: number) => {
    const currentImages = [...(formData.additional_images || [])];
    if (index < currentImages.length - 1) {
      [currentImages[index], currentImages[index + 1]] = [currentImages[index + 1], currentImages[index]];
      onChange('additional_images', currentImages);
    }
  };

  return (
    <div className="space-y-6">
      {/* Imagem principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Imagem Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="main_image">URL da Imagem Principal *</Label>
            <Input
              id="main_image"
              value={formData.image}
              onChange={(e) => handleMainImageChange(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          {formData.image && (
            <div className="mt-4">
              <Label>Preview:</Label>
              <div className="mt-2 w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <img
                  src={formData.image}
                  alt="Preview da imagem principal"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="text-gray-400 text-sm">Erro ao carregar imagem</div>';
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Imagens adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Imagens Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="URL da imagem adicional"
              onKeyPress={(e) => e.key === 'Enter' && handleAddAdditionalImage()}
            />
            <Button
              onClick={handleAddAdditionalImage}
              disabled={!newImageUrl.trim()}
              type="button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {formData.additional_images && formData.additional_images.length > 0 && (
            <div className="space-y-3">
              <Label>Imagens Adicionais ({formData.additional_images.length})</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.additional_images.map((imageUrl, index) => (
                  <div key={index} className="relative border rounded-lg p-2 bg-gray-50">
                    <div className="aspect-square mb-2 bg-white rounded border flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt={`Imagem adicional ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="text-gray-400 text-xs">Erro ao carregar</div>';
                        }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-600 mb-2 break-all">
                      {imageUrl}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveImageUp(index)}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveImageDown(index)}
                          disabled={index === formData.additional_images!.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          ↓
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveAdditionalImage(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>💡 Dicas para melhores resultados:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Use imagens em alta resolução (mínimo 800x800px)</li>
              <li>Prefira formato JPG ou PNG</li>
              <li>Mantenha o fundo limpo e neutro</li>
              <li>A primeira imagem adicional aparecerá como segunda opção na galeria</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImagesTab;