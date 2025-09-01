
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';

interface ProductPageHeaderProps {
  onBackClick: () => void;
  product?: Product;
  isLoading?: boolean;
}

const ProductPageHeader = ({ onBackClick, product, isLoading }: ProductPageHeaderProps) => {
  const { isAdmin } = useAuth();

  const handleEditProduct = () => {
    if (product) {
      // Abrir admin e focar na edição deste produto específico
      window.open(`/admin?edit_product=${product.id}`, '_blank');
    }
  };
  if (isLoading) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            onClick={onBackClick}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBackClick}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/ad4a0480-9a16-4bb6-844b-c579c660c65d.png" 
              alt="UTI DOS GAMES" 
              className="h-8 w-8"
            />
            <h1 className="text-lg font-bold text-gray-900">
              {product ? product.name : 'UTI DOS GAMES'}
            </h1>
          </div>
        </div>
        
        {isAdmin && product && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditProduct}
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Editar no Admin
          </Button>
        )}
      </div>
    </header>
  );
};

export default ProductPageHeader;
