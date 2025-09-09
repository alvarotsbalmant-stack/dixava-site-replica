import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from '@/components/ui/dialog';
import { 
  LogIn, 
  UserPlus, 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthModalProfessionalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'email-verification' | 'success';

export const AuthModalProfessional = ({ isOpen, onClose }: AuthModalProfessionalProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn, signUp, user } = useAuth();

  // Auto-close when user is authenticated
  useEffect(() => {
    if (user && isOpen && mode !== 'email-verification') {
      onClose();
    }
  }, [user, isOpen, onClose, mode]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setEmail('');
      setPassword('');
      setName('');
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (mode === 'login') {
        const result = await signIn(email, password);
        if (result?.error) {
          setErrors({ form: 'Email ou senha incorretos' });
        } else {
          setMode('success');
          setTimeout(() => onClose(), 2000);
        }
      } else if (mode === 'signup') {
        const result = await signUp(email, password, name);
        if (result?.error) {
          setErrors({ form: result.error.message || 'Erro ao criar conta' });
        } else {
          setMode('email-verification');
        }
      }
    } catch (error: any) {
      setErrors({ form: error.message || 'Erro inesperado' });
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setPassword('');
    if (newMode === 'login') {
      setName('');
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.3
      }
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const renderHeader = () => {
    const titles = {
      login: 'Bem-vindo de volta',
      signup: 'Criar sua conta',
      'forgot-password': 'Recuperar senha',
      'email-verification': 'Confirme seu email',
      success: 'Login realizado!'
    };

    const subtitles = {
      login: 'Entre na sua conta para continuar',
      signup: 'Junte-se à nossa comunidade gamer',
      'forgot-password': 'Enviaremos um link para redefinir sua senha',
      'email-verification': 'Verifique sua caixa de entrada',
      success: 'Redirecionando...'
    };

    return (
      <motion.div 
        className="text-center mb-8"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              {mode === 'success' ? (
                <CheckCircle className="w-8 h-8 text-white" />
              ) : mode === 'email-verification' ? (
                <Mail className="w-8 h-8 text-white" />
              ) : mode === 'signup' ? (
                <UserPlus className="w-8 h-8 text-white" />
              ) : (
                <LogIn className="w-8 h-8 text-white" />
              )}
            </div>
            {mode === 'success' && (
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              >
                <Sparkles className="w-6 h-6 text-amber-400" />
              </motion.div>
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {titles[mode]}
        </h2>
        <p className="text-gray-600 text-sm">
          {subtitles[mode]}
        </p>
      </motion.div>
    );
  };

  const renderBackButton = () => {
    if (mode === 'login' || mode === 'success') return null;

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleModeChange('login')}
        className="absolute top-4 left-4 p-2 h-auto text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
      </Button>
    );
  };

  const renderCloseButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className="absolute top-4 right-4 p-2 h-auto text-gray-400 hover:text-gray-600"
    >
      <X className="w-4 h-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md w-full">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {renderBackButton()}
          {renderCloseButton()}
          
          <div className="px-8 py-10">
            <AnimatePresence mode="wait">
              <motion.div key={mode}>
                {renderHeader()}
                
                {mode === 'email-verification' ? (
                  <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center space-y-4"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                      <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-gray-700 mb-4">
                        Enviamos um link de confirmação para:
                      </p>
                      <p className="font-semibold text-gray-900 bg-white px-4 py-2 rounded-lg border">
                        {email}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      Não recebeu o email? Verifique sua pasta de spam ou{' '}
                      <button 
                        className="text-amber-600 hover:text-amber-700 font-medium"
                        onClick={() => {/* Reenviar email */}}
                      >
                        clique aqui para reenviar
                      </button>
                    </p>
                  </motion.div>
                ) : mode === 'success' ? (
                  <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="text-center"
                  >
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <p className="text-green-800 font-medium">
                        Login realizado com sucesso!
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {errors.form && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{errors.form}</p>
                      </motion.div>
                    )}

                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Nome completo
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={cn(
                              "pl-10 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400",
                              errors.name && "border-red-300 focus:border-red-400 focus:ring-red-400"
                            )}
                            placeholder="Seu nome completo"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(
                            "pl-10 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400",
                            errors.email && "border-red-300 focus:border-red-400 focus:ring-red-400"
                          )}
                          placeholder="seu@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={cn(
                            "pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-400",
                            errors.password && "border-red-300 focus:border-red-400 focus:ring-red-400"
                          )}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>

                    {mode === 'login' && (
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => handleModeChange('forgot-password')}
                          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Esqueceu a senha?
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processando...
                        </div>
                      ) : mode === 'signup' ? (
                        'Criar conta'
                      ) : (
                        'Entrar'
                      )}
                    </Button>

                    <div className="text-center pt-4">
                      {mode === 'login' ? (
                        <p className="text-sm text-gray-600">
                          Não tem uma conta?{' '}
                          <button
                            type="button"
                            onClick={() => handleModeChange('signup')}
                            className="text-amber-600 hover:text-amber-700 font-semibold"
                          >
                            Criar conta
                          </button>
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Já tem uma conta?{' '}
                          <button
                            type="button"
                            onClick={() => handleModeChange('login')}
                            className="text-amber-600 hover:text-amber-700 font-semibold"
                          >
                            Fazer login
                          </button>
                        </p>
                      )}
                    </div>
                  </motion.form>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

