
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Upload, Link, X, Check } from 'lucide-react';
import { Product } from '@/hooks/useProducts/types';
import { toast } from 'sonner';

interface BulkImageUploadProps {
  selectedProducts: string[];
  products: Product[];
  onClose: () => void;
  onImageUpload: (productId: string, imageUrl: string, isMainImage?: boolean) => void;
}

const BulkImageUpload: React.FC<BulkImageUploadProps> = ({
  selectedProducts,
  products,
  onClose,
  onImageUpload
}) => {
  const [bulkUrls, setBulkUrls] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadType, setUploadType] = useState<'main' | 'secondary'>('secondary');

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  const handleBulkUrlUpload = async () => {
    if (!bulkUrls.trim() || selectedProducts.length === 0) {
      toast.error('Adicione URLs e selecione produtos');
      return;
    }

    setIsProcessing(true);
    const urls = bulkUrls.split('\n').filter(url => url.trim());
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const productId of selectedProducts) {
        for (const url of urls) {
          if (url.trim()) {
            try {
              await onImageUpload(productId, url.trim(), uploadType === 'main');
              successCount++;
            } catch (error) {
              errorCount++;
            }
          }
        }
      }

      toast.success(`${successCount} imagens adicionadas com sucesso!`);
      if (errorCount > 0) {
        toast.warning(`${errorCount} imagens falharam`);
      }
      
      setBulkUrls('');
    } catch (error) {
      toast.error('Erro no upload em lote');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || selectedProducts.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const productId of selectedProducts) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            // Simular upload - na implementação real, você usaria useImageUpload
            const formData = new FormData();
            formData.append('file', file);
            
            // Aqui você faria o upload real do arquivo
            // const uploadedUrl = await uploadImage(file, 'products');
            
            // Por enquanto, vamos simular um URL
            const mockUrl = `https://example.com/image-${Date.now()}-${i}.jpg`;
            await onImageUpload(productId, mockUrl, uploadType === 'main');
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
      }

      toast.success(`${successCount} imagens enviadas com sucesso!`);
      if (errorCount > 0) {
        toast.warning(`${errorCount} uploads falharam`);
      }
    } catch (error) {
      toast.error('Erro no upload em lote');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upload em Lote</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Produtos Selecionados */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Produtos Selecionados ({selectedProducts.length})
          </h4>
          {selectedProductsData.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {selectedProductsData.map((product) => (
                <Badge key={product.id} variant="secondary" className="text-xs">
                  {product.name.length > 20 
                    ? `${product.name.substring(0, 20)}...` 
                    : product.name
                  }
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Selecione produtos nos cards acima para usar o upload em lote
            </p>
          )}
        </div>

        <Separator />

        {/* Tipo de Upload */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Tipo de Imagem</h4>
          <div className="flex gap-2">
            <Button
              variant={uploadType === 'main' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadType('main')}
            >
              Imagem Principal
            </Button>
            <Button
              variant={uploadType === 'secondary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUploadType('secondary')}
            >
              Imagens Secundárias
            </Button>
          </div>
        </div>

        <Separator />

        {/* Upload por URLs */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            <Link className="w-4 h-4 inline mr-2" />
            Adicionar por URLs
          </h4>
          <Textarea
            placeholder="Cole as URLs das imagens (uma por linha)&#10;https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.jpg"
            value={bulkUrls}
            onChange={(e) => setBulkUrls(e.target.value)}
            rows={4}
            className="mb-3"
          />
          <Button
            onClick={handleBulkUrlUpload}
            disabled={!bulkUrls.trim() || selectedProducts.length === 0 || isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Processando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Aplicar URLs ({bulkUrls.split('\n').filter(url => url.trim()).length} URLs)
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Upload de Arquivos */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            <Upload className="w-4 h-4 inline mr-2" />
            Upload de Arquivos
          </h4>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            disabled={selectedProducts.length === 0 || isProcessing}
          />
          <p className="text-xs text-gray-500 mt-2">
            Selecione múltiplas imagens para enviar para todos os produtos selecionados
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkImageUpload;
