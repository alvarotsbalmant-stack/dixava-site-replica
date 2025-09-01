import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Tag, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/hooks/useProducts/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductManagementSettingsProps {
  products: Product[];
  selectedProducts: string[];
  setSelectedProducts: (products: string[]) => void;
  isDeleting: boolean;
  handleDeleteAllProducts: () => void;
  handleDeleteSelectedProducts: () => void;
  handleProductSelection: (productId: string, checked: boolean) => void;
  selectAllProducts: () => void;
  deselectAllProducts: () => void;
  refreshProducts: () => Promise<void>;
}

export const ProductManagementSettings: React.FC<ProductManagementSettingsProps> = ({
  products,
  selectedProducts,
  setSelectedProducts,
  isDeleting,
  handleDeleteAllProducts,
  handleDeleteSelectedProducts,
  handleProductSelection,
  selectAllProducts,
  deselectAllProducts,
  refreshProducts
}) => {
  const { toast } = useToast();
  const [isGeneratingSKUs, setIsGeneratingSKUs] = useState(false);

  // Função para gerar código SKU único
  const generateUniqueSKU = (productName: string, existingSkus: Set<string>): string => {
    const cleanName = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
    
    let counter = 1;
    let baseSku = cleanName || 'PROD';
    let sku = `${baseSku}${String(counter).padStart(3, '0')}`;
    
    while (existingSkus.has(sku)) {
      counter++;
      sku = `${baseSku}${String(counter).padStart(3, '0')}`;
    }
    
    existingSkus.add(sku);
    return sku;
  };

  // Função para gerar SKUs para produtos sem código SKU
  const handleGenerateSKUs = async () => {
    setIsGeneratingSKUs(true);
    try {
      // Buscar todos os produtos existentes para verificar SKUs existentes
      const { data: allProducts, error: fetchError } = await supabase
        .from('products')
        .select('id, name, sku_code');

      if (fetchError) {
        throw fetchError;
      }

      // Criar conjunto de SKUs existentes
      const existingSkus = new Set<string>();
      const productsWithoutSku: Array<{ id: string; name: string }> = [];

      allProducts?.forEach(product => {
        if (product.sku_code) {
          existingSkus.add(product.sku_code);
        } else {
          productsWithoutSku.push({ id: product.id, name: product.name });
        }
      });

      if (productsWithoutSku.length === 0) {
        toast({
          title: "Nenhum produto encontrado",
          description: "Todos os produtos já possuem código SKU.",
        });
        return;
      }

      // Gerar SKUs únicos para produtos sem SKU
      const updates = productsWithoutSku.map(product => ({
        id: product.id,
        sku_code: generateUniqueSKU(product.name, existingSkus)
      }));

      // Atualizar produtos em lotes
      const batchSize = 50;
      let updatedCount = 0;

      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        for (const update of batch) {
          const { error } = await supabase
            .from('products')
            .update({ sku_code: update.sku_code })
            .eq('id', update.id);

          if (error) {
            console.error(`Erro ao atualizar produto ${update.id}:`, error);
          } else {
            updatedCount++;
          }
        }
      }

      await refreshProducts();

      toast({
        title: "SKUs gerados com sucesso",
        description: `${updatedCount} produtos receberam códigos SKU únicos.`,
      });

    } catch (error) {
      console.error('Erro ao gerar SKUs:', error);
      toast({
        title: "Erro ao gerar SKUs",
        description: "Ocorreu um erro ao gerar os códigos SKU. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingSKUs(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Gerenciamento de Produtos
        </CardTitle>
        <CardDescription>
          Gerar códigos SKU, deletar produtos em massa ou individualmente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gerar códigos SKU */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">Códigos SKU</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleGenerateSKUs}
              disabled={isGeneratingSKUs || products.length === 0}
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingSKUs ? 'animate-spin' : ''}`} />
              {isGeneratingSKUs ? 'Gerando SKUs...' : 'Gerar SKUs para Produtos'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Esta função irá gerar códigos SKU únicos para todos os produtos que ainda não possuem um código SKU. 
            Isso facilitará o uso do sistema de edição em massa e backup de produtos.
          </p>
        </div>

        <Separator />

        {/* Deletar todos os produtos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={isDeleting || products.length === 0}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Deletar Todos os Produtos ({products.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deletar todos os produtos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os {products.length} produtos serão permanentemente removidos do banco de dados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllProducts} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? 'Deletando...' : 'Deletar Todos'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Separator />

        {/* Seleção de produtos para deletar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Deletar Produtos Selecionados</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAllProducts}>
                Selecionar Todos
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllProducts}>
                Limpar Seleção
              </Button>
            </div>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {selectedProducts.length} produto(s) selecionado(s)
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Deletar Selecionados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Deletar produtos selecionados?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. {selectedProducts.length} produto(s) serão permanentemente removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelectedProducts} className="bg-destructive hover:bg-destructive/90">
                      {isDeleting ? 'Deletando...' : 'Deletar Selecionados'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Lista de produtos */}
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum produto encontrado</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`product-${product.id}`}
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => handleProductSelection(product.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor={`product-${product.id}`}
                    className="flex-1 text-sm cursor-pointer hover:text-primary"
                  >
                    {product.name} - R$ {product.price}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};