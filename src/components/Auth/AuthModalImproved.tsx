import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LogIn, UserPlus, X, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { LogoImage } from '@/components/OptimizedImage/LogoImage';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'auth' | 'email-verification' | 'success';

export const AuthModalImproved = ({ isOpen, onClose }: AuthModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalState>('auth');
  const [activeTab, setActiveTab] = useState('login');
  const { signIn, signUp, user } = useAuth();

  // Close modal automatically when user becomes logged in (only for login, not signup)
  useEffect(() => {
    if (user && isOpen && modalState === 'auth') {
      console.log('[AUTH MODAL] User detected, auto-closing modal');
      onClose();
    }
  }, [user, isOpen, onClose, modalState]);

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setModalState('auth');
      setActiveTab('login');
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setModalState('auth');
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('[AUTH MODAL] Attempting login...');
      await signIn(email, password);
      console.log('[AUTH MODAL] Login successful');
      
      // Reset form fields
      resetForm();
      
      // Modal will close automatically via useEffect when user state updates
      
    } catch (error) {
      console.error('[AUTH MODAL] Login failed:', error);
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('[AUTH MODAL] Attempting signup...');
      const result = await signUp(email, password, name);
      console.log('[AUTH MODAL] Signup result:', result);
      
      // Check if email verification is needed
      // Supabase typically returns user but requires email confirmation
      setModalState('email-verification');
      setLoading(false);
      
    } catch (error) {
      console.error('[AUTH MODAL] Signup failed:', error);
      setLoading(false);
    }
  };

  const handleBackToAuth = () => {
    setModalState('auth');
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white border-0 text-gray-900 max-w-md shadow-2xl rounded-2xl overflow-hidden p-0">
        <AnimatePresence mode="wait">
          {modalState === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header minimalista */}
              <DialogHeader className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 border-b border-gray-100">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 hover:bg-gray-200 w-8 h-8 p-0 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <LogoImage 
                      src="/lovable-uploads/a514a032-d79a-4bc4-a10e-3c9f0f9cde73.png" 
                      alt="UTI DOS GAMES" 
                      className="w-12 h-12"
                      priority={true}
                    />
                  </div>
                  <DialogTitle className="text-xl font-semibold text-gray-800 mb-1">
                    Bem-vindo
                  </DialogTitle>
                  <p className="text-sm text-gray-500">Entre na sua conta ou crie uma nova</p>
                </div>
              </DialogHeader>
              
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6">
                    <TabsTrigger 
                      value="login" 
                      className="text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-medium rounded-lg transition-all duration-200"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-medium rounded-lg transition-all duration-200"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="text-gray-700 font-medium text-sm">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border border-gray-200 focus:border-gray-400 focus:ring-0 rounded-xl h-11 bg-gray-50 focus:bg-white transition-colors"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-gray-700 font-medium text-sm">Senha</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border border-gray-200 focus:border-gray-400 focus:ring-0 rounded-xl h-11 bg-gray-50 focus:bg-white transition-colors"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 h-11 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Entrando...
                          </div>
                        ) : (
                          "Entrar"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="mt-0">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-gray-700 font-medium text-sm">Nome completo</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="border border-gray-200 focus:border-gray-400 focus:ring-0 rounded-xl h-11 bg-gray-50 focus:bg-white transition-colors"
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-gray-700 font-medium text-sm">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="border border-gray-200 focus:border-gray-400 focus:ring-0 rounded-xl h-11 bg-gray-50 focus:bg-white transition-colors"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-gray-700 font-medium text-sm">Senha</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="border border-gray-200 focus:border-gray-400 focus:ring-0 rounded-xl h-11 bg-gray-50 focus:bg-white transition-colors"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <p className="text-xs text-gray-500">Mínimo de 6 caracteres</p>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 h-11 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Criando conta...
                          </div>
                        ) : (
                          "Criar conta"
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="px-6 pb-6">
                <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
                  <p>Ao continuar, você concorda com nossos termos de uso</p>
                </div>
              </div>
            </motion.div>
          )}

          {modalState === 'email-verification' && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header de verificação */}
              <DialogHeader className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 hover:bg-white/50 w-8 h-8 p-0 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <DialogTitle className="text-xl font-semibold text-gray-800 mb-1">
                    Verifique seu email
                  </DialogTitle>
                  <p className="text-sm text-gray-500">Conta criada com sucesso!</p>
                </div>
              </DialogHeader>
              
              <div className="p-6 text-center space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-800 mb-2">Email de confirmação enviado</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Enviamos um link de confirmação para:
                  </p>
                  <p className="font-medium text-gray-800 bg-white px-3 py-2 rounded-lg border">
                    {email}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    <strong>Importante:</strong> Clique no link do email para ativar sua conta e fazer login.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <Button
                    onClick={handleBackToAuth}
                    variant="outline"
                    className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-11"
                  >
                    Voltar ao login
                  </Button>
                  
                  <Button
                    onClick={handleClose}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

