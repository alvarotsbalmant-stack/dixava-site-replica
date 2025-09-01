
import { User, ShoppingCart } from 'lucide-react'; // Removed Repeat import
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import GlobalCartIcon from '@/components/GlobalCart/GlobalCartIcon';
import { cn } from '@/lib/utils';

interface HeaderActionsProps {
  onCartOpen: () => void; // Keep for GlobalCartIcon if needed internally
  onAuthOpen: () => void;
}

// **Redesign based on GameStop Header Actions**
const HeaderActions = ({ 
  onAuthOpen,
  onCartOpen // Keep if GlobalCartIcon needs it
}: HeaderActionsProps) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    if (user && isAdmin) {
      navigate('/admin');
    } else {
      onAuthOpen(); // Open auth modal for login/signup or non-admin user account view
    }
  };

  // Trade-In function removed

  return (
    <div className="flex items-center space-x-1 sm:space-x-2"> {/* Reduced spacing slightly */}
      
      {/* Trade-In Button removed */}

      {/* User Account / Sign In Button (Desktop Only) - REMOVED hover effects for mobile */}
      <Button 
        onClick={handleLoginClick} 
        variant="ghost" 
        size="sm" // Smaller button size
        className={cn(
          "hidden md:flex items-center text-xs font-medium text-foreground px-2 py-1", // Adjusted styling
          // Apply hover effects only on desktop (md and above)
          "md:hover:text-primary md:hover:bg-secondary"
        )}
      >
        <User className="w-4 h-4 mr-1" />
        {user ? (isAdmin ? 'Admin' : 'Conta') : 'Login'}
      </Button>

      {/* Global Shopping Cart Icon - Always visible */}
      <GlobalCartIcon onCartOpen={onCartOpen} /> 

      {/* Mobile Menu Toggle is handled outside this component now */}
    </div>
  );
};

export default HeaderActions;
