import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'lucide-react';
import { ProductFormData } from '@/types/product-extended';

interface RelatedProductsTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const RelatedProductsTab: React.FC<RelatedProductsTabProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Produtos Relacionados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="related_products">IDs dos Produtos Relacionados</Label>
            <Input
              id="related_products"
              value={formData.manual_related_products?.join(', ') || ''}
              onChange={(e) => {
                const ids = e.target.value.split(',').map(id => id.trim()).filter(Boolean);
                onChange('manual_related_products', ids);
              }}
              placeholder="ID1, ID2, ID3..."
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separar IDs por vírgula. Deixe vazio para usar relacionamento automático.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatedProductsTab;

