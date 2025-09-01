import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useProducts';
import { useProductSpecifications } from '@/hooks/useProductSpecifications';
import { Search, Edit, Save, Plus, Monitor, Package, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import ProductDesktopEditor from '@/components/Admin/ProductDesktopManager/ProductDesktopEditor';

const ProductDesktopManager: React.FC = () => {
  const { products, loading, updateProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsEditorOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      await updateProduct(selectedProduct.id, productData);
      toast.success('Produto atualizado com sucesso!');
      setIsEditorOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      toast.error('Erro ao atualizar produto');
      console.error('Erro ao salvar produto:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-muted rounded mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos Desktop</h1>
            <p className="text-muted-foreground">
              Configure informações detalhadas para a versão desktop do site
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {filteredProducts.length} produtos
        </Badge>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nome, marca ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4">
        {filteredProducts.map((product) => (
          <ProductDesktopCard
            key={product.id}
            product={product}
            onEdit={handleEditProduct}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && searchTerm && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os termos da pesquisa
            </p>
          </CardContent>
        </Card>
      )}

      {/* Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0 gap-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Produto Desktop: {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedProduct && (
              <ProductDesktopEditor
                product={selectedProduct}
                onSave={handleSaveProduct}
                onCancel={() => setIsEditorOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Product Card Component
const ProductDesktopCard: React.FC<{
  product: any;
  onEdit: (product: any) => void;
}> = ({ product, onEdit }) => {
  const { categorizedSpecs } = useProductSpecifications(product.id, 'desktop', product);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Product Image */}
          <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {product.category || 'Sem categoria'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Marca: {product.brand || 'A definir'}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="flex-shrink-0"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium text-foreground">
                  {categorizedSpecs?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Categorias</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium text-foreground">
                  {categorizedSpecs?.reduce((acc, cat) => acc + cat.items.length, 0) || 0}
                </div>
                <div className="text-xs text-muted-foreground">Especificações</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium text-foreground">
                  R$ {Number(product.price || 0).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Preço</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium text-foreground">
                  {product.stock || 0}
                </div>
                <div className="text-xs text-muted-foreground">Estoque</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDesktopManager;