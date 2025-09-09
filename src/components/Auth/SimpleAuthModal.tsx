import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LogIn, UserPlus, X } from 'lucide-react';
import { LogoImage } from '@/components/OptimizedImage/LogoImage';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

interface SimpleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleAuthModal = ({ isOpen, onClose }: SimpleAuthModalProps) => {
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();

  // Auto-close when user logs in
  useEffect(() => {
    if (user && isOpen) {
      console.log('[AUTH MODAL] User detected, auto-closing modal');
      onClose();
    }
  }, [user, isOpen, onClose]);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      await signIn(email, password);
      onClose();
    } catch (error) {
      console.error('[AUTH MODAL] Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      await signUp(email, password, name);
      onClose();
    } catch (error) {
      console.error('[AUTH MODAL] Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-md shadow-2xl sm:max-w-md w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] mx-auto my-auto overflow-y-auto">
        <DialogHeader className="text-center relative">
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute -right-2 -top-2 text-muted-foreground hover:text-primary w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <LogoImage 
              src="/lovable-uploads/a514a032-d79a-4bc4-a10e-3c9f0f9cde73.png" 
              alt="UTI DOS GAMES" 
              className="w-16 h-16"
              priority={true}
            />
            <div>
              <DialogTitle className="text-2xl font-bold text-primary">
                UTI DOS GAMES
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Faça login em sua conta</p>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted rounded-lg p-1">
            <TabsTrigger 
              value="login" 
              className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-md transition-all duration-200"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium rounded-md transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastrar
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-6">
            <LoginForm onSubmit={handleSignIn} loading={loading} />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <SignUpForm onSubmit={handleSignUp} loading={loading} />
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
          <p>Ao fazer login, você concorda com nossos termos de uso.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};