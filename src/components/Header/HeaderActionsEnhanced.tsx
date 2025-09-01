import React, { useState } from 'react';
import { User, ShoppingCart, ChevronDown, Heart, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import GlobalCartIcon from '@/components/GlobalCart/GlobalCartIcon';
import { DailyCodeWidget } from '@/components/Retention/DailyCodeWidget';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderActionsProps {
  onCartOpen: () => void;
  onAuthOpen: () => void;
}

const HeaderActionsEnhanced = ({ 
  onAuthOpen,
  onCartOpen
}: HeaderActionsProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Debug log to track auth state changes
  console.log('[HEADER] Auth state - User:', user?.email, 'isAdmin:', isAdmin, 'User exists:', !!user);

  const handleLoginClick = () => {
    if (user && isAdmin) {
      navigate('/admin');
    } else {
      onAuthOpen();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleAreaCliente = () => {
    navigate('/area-cliente');
  };

  const handleListaDesejos = () => {
    navigate('/lista-desejos');
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      
      {/* User Account / Sign In Button (Desktop Only) */}
      {user ? (
        // Dropdown para usuário logado
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "hidden md:flex items-center text-xs font-medium text-foreground px-2 py-1",
                "md:hover:text-primary md:hover:bg-secondary"
              )}
            >
              <User className="w-4 h-4 mr-1" />
              {isAdmin ? 'Admin' : 'Conta'}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!isAdmin && (
              <>
                <DropdownMenuItem onClick={handleAreaCliente}>
                  <User className="w-4 h-4 mr-2" />
                  Ver dados da conta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleListaDesejos}>
                  <Heart className="w-4 h-4 mr-2" />
                  Lista de Desejos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {isAdmin && (
              <>
                <DropdownMenuItem onClick={() => navigate('/admin')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Painel Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // Botão de login para usuário não logado
        <Button 
          onClick={handleLoginClick} 
          variant="ghost" 
          size="sm"
          className={cn(
            "hidden md:flex items-center text-xs font-medium text-foreground px-2 py-1",
            "md:hover:text-primary md:hover:bg-secondary"
          )}
        >
          <User className="w-4 h-4 mr-1" />
          Login
        </Button>
      )}

      {/* Daily Code Widget - For all logged users */}
      {user && <DailyCodeWidget />}

      {/* Global Shopping Cart Icon - Always visible */}
      <GlobalCartIcon onCartOpen={onCartOpen} /> 
    </div>
  );
};

export default HeaderActionsEnhanced;

