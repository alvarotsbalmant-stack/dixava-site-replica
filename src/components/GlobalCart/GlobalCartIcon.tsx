
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface GlobalCartIconProps {
  onCartOpen: () => void;
}

const GlobalCartIcon: React.FC<GlobalCartIconProps> = ({ onCartOpen }) => {
  const { getCartItemsCount } = useCart();
  const itemCount = getCartItemsCount();
  const isMobile = useIsMobile();

  return (
    <Button
      onClick={onCartOpen}
      variant="ghost"
      size="sm"
      className={cn(
        "relative flex items-center text-xs font-medium text-foreground px-2 py-1",
        "md:hover:text-primary md:hover:bg-secondary", // Apply hover only on medium screens and up
        "hidden lg:flex" // Hide on mobile, show on desktop
      )}
    >
      <ShoppingCart className="w-4 h-4 mr-1" />
      
      {itemCount > 0 && (
        <span className={cn(
          "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full",
          "bg-uti-red text-primary-foreground text-[10px] font-bold"
        )}>
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
};

export default GlobalCartIcon;
