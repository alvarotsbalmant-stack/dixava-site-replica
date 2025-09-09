import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  ArrowLeft,
  Sparkles,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ProfessionalInput, 
  PasswordInput, 
  ProfessionalButton,
  FormError,
  FormSuccess
} from './FormComponents';
import { 
  FloatingParticles, 
  SuccessCelebration, 
  TypingText,
  PulsingIcon,
  SlideIn,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  Shake
} from './AnimatedElements';

interface AuthModalFinalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'email-verification' | 'success';

export const AuthModalFinal = ({ isOpen, onClose }: AuthModalFinalProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeError, setShakeError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { signIn, signUp, user } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Auto-close when user is authenticated
  useEffect(() => {
    if (user && isOpen && mode !== 'email-verification') {
      setMode('success');
      setTimeout(() => onClose(), 2500);
    }
  }, [user, isOpen, onClose, mode]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setMode('login');
      resetForm();
      // Focus first input after animation
      setTimeout(() => {
        emailRef.current?.focus();
      }, 500);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        // Custom tab handling for better UX
        e.preventDefault();
        const inputs = [emailRef.current, passwordRef.current, nameRef.current].filter(Boolean);
        const currentIndex = inputs.findIndex(input => input === document.activeElement);
        const nextIndex = e.shiftKey 
          ? (currentIndex - 1 + inputs.length) % inputs.length
          : (currentIndex + 1) % inputs.length;
        inputs[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, mode]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setErrors({});
    setShowPassword(false);
    setShakeError(false);
    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    } else if (mode === 'signup') {
      // Stronger validation for signup
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        newErrors.password = 'Senha deve conter maiúscula, minúscula e número';
      }
    }

    // Name validation for signup
    if (mode === 'signup') {
      if (!name.trim()) {
        newErrors.name = 'Nome é obrigatório';
      } else if (name.trim().length < 2) {
        newErrors.name = 'Nome muito curto';
      }
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (mode === 'login') {
        const result = await signIn(email.trim(), password);
        if (result?.error) {
          setErrors({ form: 'Email ou senha incorretos' });
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        }
      } else if (mode === 'signup') {
        const result = await signUp(email.trim(), password, name.trim());
        if (result?.error) {
          setErrors({ form: result.error.message || 'Erro ao criar conta' });
          setShakeError(true);
          setTimeout(() => setShakeError(false), 500);
        } else {
          setMode('email-verification');
        }
      }
    } catch (error: any) {
      setErrors({ form: error.message || 'Erro inesperado' });
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
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
    
    // Focus appropriate field after mode change
    setTimeout(() => {
      if (newMode === 'signup' && !name) {
        nameRef.current?.focus();
      } else {
        emailRef.current?.focus();
      }
    }, 300);
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: 0.5
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: 50,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const renderHeader = () => {
    const config = {
      login: {
        title: 'Bem-vindo de volta',
        subtitle: 'Entre na sua conta para continuar',
        icon: LogIn,
        gradient: 'from-blue-500 to-purple-600'
      },
      signup: {
        title: 'Criar sua conta',
        subtitle: 'Junte-se à nossa comunidade gamer',
        icon: UserPlus,
        gradient: 'from-green-500 to-teal-600'
      },
      'forgot-password': {
        title: 'Recuperar senha',
        subtitle: 'Enviaremos um link para seu email',
        icon: Mail,
        gradient: 'from-orange-500 to-red-600'
      },
      'email-verification': {
        title: 'Confirme seu email',
        subtitle: 'Verifique sua caixa de entrada',
        icon: Mail,
        gradient: 'from-blue-500 to-indigo-600'
      },
      success: {
        title: 'Sucesso!',
        subtitle: 'Login realizado com sucesso',
        icon: CheckCircle2,
        gradient: 'from-green-500 to-emerald-600'
      }
    };

    const { title, subtitle, icon: Icon, gradient } = config[mode];

    return (
      <StaggerContainer className="text-center mb-8">
        <StaggerItem>
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <PulsingIcon
                icon={
                  <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-3xl flex items-center justify-center shadow-xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                }
                className="w-20 h-20"
              />
              
              {mode === 'success' && <SuccessCelebration />}
              {mode !== 'success' && <FloatingParticles />}
            </div>
          </div>
        </StaggerItem>
        
        <StaggerItem>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            <TypingText text={title} />
          </h2>
        </StaggerItem>
        
        <StaggerItem>
          <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
            {subtitle}
          </p>
        </StaggerItem>
      </StaggerContainer>
    );
  };

  const renderNavigation = () => (
    <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
      {(mode !== 'login' && mode !== 'success') && (
        <HoverScale>
          <button
            onClick={() => handleModeChange('login')}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </HoverScale>
      )}
      
      <div className="ml-auto">
        <HoverScale>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </HoverScale>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/60 backdrop-blur-md" />
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md w-full mx-4 sm:mx-auto">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-3xl shadow-2xl overflow-hidden relative min-h-[500px] sm:min-h-[600px]"
        >
          {renderNavigation()}
          
          <div className="px-8 py-16 sm:px-10 sm:py-20">
            <AnimatePresence mode="wait">
              <motion.div key={mode}>
                {renderHeader()}
                
                {mode === 'email-verification' ? (
                  <SlideIn direction="up" className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-8 text-center">
                      <Mail className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                      <p className="text-gray-700 mb-6 text-lg">
                        Enviamos um link de confirmação para:
                      </p>
                      <div className="bg-white border-2 border-blue-200 rounded-xl px-4 py-3 font-mono text-sm text-gray-800 break-all">
                        {email}
                      </div>
                    </div>
                    
                    <p className="text-center text-gray-600">
                      Não recebeu? Verifique o spam ou{' '}
                      <button 
                        className="text-blue-600 hover:text-blue-700 font-semibold underline"
                        onClick={() => {/* Reenviar email */}}
                      >
                        reenvie o email
                      </button>
                    </p>
                  </SlideIn>
                ) : mode === 'success' ? (
                  <SlideIn direction="up" className="text-center">
                    <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-8">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                      <p className="text-green-800 font-semibold text-lg">
                        Redirecionando...
                      </p>
                    </div>
                  </SlideIn>
                ) : (
                  <Shake trigger={shakeError}>
                    <SlideIn direction="up">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence>
                          {errors.form && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <FormError message={errors.form} />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <StaggerContainer staggerDelay={0.1}>
                          {mode === 'signup' && (
                            <StaggerItem>
                              <ProfessionalInput
                                ref={nameRef}
                                id="name"
                                label="Nome completo"
                                icon={<User className="w-4 h-4" />}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                error={errors.name}
                                success={!errors.name && name.length >= 2}
                                placeholder="Seu nome completo"
                                className={cn(
                                  "transition-all duration-200",
                                  focusedField === 'name' && "ring-2 ring-blue-200"
                                )}
                                autoComplete="name"
                              />
                            </StaggerItem>
                          )}

                          <StaggerItem>
                            <ProfessionalInput
                              ref={emailRef}
                              id="email"
                              type="email"
                              label="Email"
                              icon={<Mail className="w-4 h-4" />}
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onFocus={() => setFocusedField('email')}
                              onBlur={() => setFocusedField(null)}
                              error={errors.email}
                              success={!errors.email && email.includes('@')}
                              placeholder="seu@email.com"
                              className={cn(
                                "transition-all duration-200",
                                focusedField === 'email' && "ring-2 ring-blue-200"
                              )}
                              autoComplete="email"
                            />
                          </StaggerItem>

                          <StaggerItem>
                            <PasswordInput
                              ref={passwordRef}
                              id="password"
                              label="Senha"
                              icon={<Lock className="w-4 h-4" />}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField(null)}
                              showPassword={showPassword}
                              onTogglePassword={() => setShowPassword(!showPassword)}
                              error={errors.password}
                              success={!errors.password && password.length >= 6}
                              placeholder="••••••••"
                              helperText={mode === 'signup' ? "Mínimo 6 caracteres com maiúscula, minúscula e número" : undefined}
                              className={cn(
                                "transition-all duration-200",
                                focusedField === 'password' && "ring-2 ring-blue-200"
                              )}
                              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            />
                          </StaggerItem>

                          {mode === 'login' && (
                            <StaggerItem>
                              <div className="text-right">
                                <HoverScale>
                                  <button
                                    type="button"
                                    onClick={() => handleModeChange('forgot-password')}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                                  >
                                    Esqueceu a senha?
                                  </button>
                                </HoverScale>
                              </div>
                            </StaggerItem>
                          )}

                          <StaggerItem>
                            <ProfessionalButton
                              type="submit"
                              loading={loading}
                              loadingText="Processando..."
                              size="lg"
                              className="w-full"
                              icon={mode === 'signup' ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                            >
                              {mode === 'signup' ? 'Criar conta' : 'Entrar'}
                            </ProfessionalButton>
                          </StaggerItem>

                          <StaggerItem>
                            <div className="text-center pt-4">
                              {mode === 'login' ? (
                                <p className="text-gray-600">
                                  Não tem uma conta?{' '}
                                  <HoverScale className="inline-block">
                                    <button
                                      type="button"
                                      onClick={() => handleModeChange('signup')}
                                      className="text-blue-600 hover:text-blue-700 font-semibold underline"
                                    >
                                      Criar conta
                                    </button>
                                  </HoverScale>
                                </p>
                              ) : (
                                <p className="text-gray-600">
                                  Já tem uma conta?{' '}
                                  <HoverScale className="inline-block">
                                    <button
                                      type="button"
                                      onClick={() => handleModeChange('login')}
                                      className="text-blue-600 hover:text-blue-700 font-semibold underline"
                                    >
                                      Fazer login
                                    </button>
                                  </HoverScale>
                                </p>
                              )}
                            </div>
                          </StaggerItem>
                        </StaggerContainer>
                      </form>
                    </SlideIn>
                  </Shake>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

