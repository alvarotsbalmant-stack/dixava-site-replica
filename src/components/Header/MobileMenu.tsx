import { useEffect } from 'react';
import { X, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useNavigationItems } from '@/hooks/useNavigationItems';
import { NavigationItem } from '@/types/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthOpen: () => void;
  categories: any[]; // Mantido para compatibilidade, mas não usado
  onCategoryClick: (category: any) => void; // Mantido para compatibilidade, mas não usado
}

const MobileMenu = ({ isOpen, onClose, onAuthOpen }: MobileMenuProps) => {
  const { user, isAdmin } = useAuth();
  const { hasActiveSubscription } = useSubscriptions();
  const navigate = useNavigate();
  const { items, loading, fetchVisibleItems } = useNavigationItems();

  // Carregar itens de navegação quando o menu abrir
  useEffect(() => {
    if (isOpen && (!items || items.length === 0)) {
      fetchVisibleItems();
    }
  }, [isOpen, fetchVisibleItems, items]);

  const handleAuthClick = () => {
    if (user) {
      navigate(isAdmin ? '/admin' : '/account'); 
      onClose();
    } else {
      onAuthOpen();
      onClose(); 
    }
  };

  const handleNavigationClick = (item: NavigationItem) => {
    if (item.link_type === 'external') {
      window.open(item.link_url, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.link_url);
    }
    onClose();
  };

  const renderIcon = (item: NavigationItem) => {
    if (!item.icon_url) return null;

    if (item.icon_type === 'emoji') {
      return <span className="text-lg mr-3">{item.icon_url}</span>;
    } else if (item.icon_type === 'image') {
      return (
        <img 
          src={item.icon_url} 
          alt={`${item.title} icon`}
          className="w-5 h-5 mr-3"
          draggable={false}
        />
      );
    } else {
      return <i className={`${item.icon_url} w-5 h-5 mr-3`} />;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        className={cn(
          "w-4/5 max-w-xs h-screen flex flex-col p-0 z-[100] lg:hidden",
          "bg-white"
        )}
        aria-describedby="mobile-menu-title"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <SheetTitle id="mobile-menu-title" className="font-semibold text-lg text-gray-800">Menu</SheetTitle>
          </div>
          <SheetClose asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "text-gray-500 rounded-full w-8 h-8",
                "md:hover:text-red-600 md:hover:bg-red-50"
              )}
            >
              <X className="w-5 h-5" />
              <span className="sr-only">Fechar menu</span>
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-6">
            {/* User Section */}
            <div className="border-b pb-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-gray-600" />
                    <div className='flex-1 min-w-0'>
                      <p className="font-medium text-gray-800 truncate text-sm">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAuthClick}
                    variant="outline"
                    className={cn(
                      "w-full h-11 text-base border-gray-300",
                      "md:hover:bg-accent md:hover:text-accent-foreground"
                    )}
                  >
                    {isAdmin ? 'Painel Admin' : 'Minha Conta'}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAuthClick}
                  className={cn(
                    "w-full bg-red-600 h-12 text-base flex items-center justify-center gap-2 text-white rounded-md font-semibold",
                    "md:hover:bg-red-700"
                  )}
                >
                  <LogIn className="w-5 h-5" />
                  Entrar / Cadastrar
                </Button>
              )}
            </div>

            {/* Navigation Items from Database */}
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-500 mb-2 flex items-center gap-2 text-sm px-3 uppercase tracking-wider">
                Navegação
              </h3>
              
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-12 bg-gray-100 rounded-md animate-pulse" />
                  ))}
                </div>
              ) : items && items.length > 0 ? (
                <div className="space-y-1">
                  {items.map((item) => (
                    <Button
                      key={item.id}
                      onClick={() => handleNavigationClick(item)}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-12 text-base px-3 text-gray-700 rounded-md font-medium",
                        "md:hover:text-red-600 md:hover:bg-red-50"
                      )}
                    >
                      {renderIcon(item)}
                      {item.title}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm px-3">
                  Nenhum item de navegação encontrado
                </div>
              )}
            </div>

            {/* Add padding at the bottom for scroll space */}
            <div className="h-16"></div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
