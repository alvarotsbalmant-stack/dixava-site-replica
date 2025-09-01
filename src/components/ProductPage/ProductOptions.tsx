import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Use Select for options

interface ProductOptionsProps {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
  onQuantityChange: (quantity: number) => void;
}

// **Radical Redesign based on GameStop reference and plan_transformacao_radical.md**
const ProductOptions: React.FC<ProductOptionsProps> = ({ 
  product, 
  selectedSize, 
  selectedColor, 
  quantity,
  onSizeChange,
  onColorChange,
  onQuantityChange
}) => {
  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;
  const isOutOfStock = product.stock === 0;

  // Use Select component for a cleaner look if more than 2-3 options
  const renderSelect = (label: string, value: string, options: string[], onChange: (value: string) => void) => (
    <div>
      <Label className="text-sm font-medium text-foreground mb-1.5 block">{label}:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Use simple buttons for few options
  const renderButtons = (label: string, value: string, options: string[], onChange: (value: string) => void) => (
    <div>
      <Label className="text-sm font-medium text-foreground mb-1.5 block">{label}:</Label>
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <Button
            key={option}
            variant={value === option ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(option)}
            className={cn(
              value === option ? 'bg-uti-red hover:bg-uti-red/90 border-uti-red' : 'border-border hover:border-uti-gray-dark'
            )}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4"> {/* Consistent spacing */}
      {/* Size Selection */}
      {hasSizes && (
        product.sizes.length > 3 
          ? renderSelect('Formato', selectedSize, product.sizes, onSizeChange)
          : renderButtons('Formato', selectedSize, product.sizes, onSizeChange)
      )}

      {/* Color Selection */}
      {hasColors && (
        product.colors.length > 3
          ? renderSelect('Cor', selectedColor, product.colors, onColorChange)
          : renderButtons('Cor', selectedColor, product.colors, onColorChange)
      )}

      {/* Quantity Selector - GameStop style is often just Add to Cart (qty 1) */}
      {/* Keeping a simple selector for now, can be removed if not needed */}
      {!isOutOfStock && (
        <div>
          <Label htmlFor="quantity" className="text-sm font-medium text-foreground mb-1.5 block">Quantidade:</Label>
          <div className="flex items-center border border-border rounded-md w-fit">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="h-9 w-9 text-muted-foreground hover:bg-accent rounded-r-none"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span id="quantity" className="text-base font-semibold w-10 text-center px-2 leading-9">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onQuantityChange(quantity + 1)} // Add stock limit check if needed
              className="h-9 w-9 text-muted-foreground hover:bg-accent rounded-l-none"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Stock Status - Can be integrated into Actions or kept minimal */}
      {product.stock !== undefined && (
        <div className={cn(
          "text-sm font-medium",
          isOutOfStock ? "text-destructive" : "text-green-600"
        )}>
          {isOutOfStock ? 'Esgotado' : 'Em estoque'}
        </div>
      )}
    </div>
  );
};

export default ProductOptions;

