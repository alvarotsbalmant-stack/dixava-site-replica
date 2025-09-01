import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ConfirmarConta = () => {
  const { codigo } = useParams<{ codigo: string }>();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<{ email: string; password?: string } | null>(null);

  useEffect(() => {
    const confirmarEmail = async () => {
      if (!codigo) {
        console.error('❌ Código de confirmação não fornecido');
        setStatus('error');
        setMessage('Código de confirmação inválido ou não fornecido');
        return;
      }

      try {
        console.log('🔄 Iniciando confirmação de email');
        console.log('🔄 Código:', codigo);
        console.log('🔄 URL completa:', window.location.href);
        console.log('🔄 User Agent:', navigator.userAgent);

        // Método 1: Tentar verifyOtp (para links tradicionais do Supabase)
        console.log('🔄 Tentativa 1: verifyOtp');
        const { data: otpData, error: otpError } = await supabase.auth.verifyOtp({
          token_hash: codigo,
          type: 'email'
        });

        console.log('🔄 Resultado verifyOtp:', { 
          success: !otpError, 
          hasUser: !!otpData?.user, 
          userEmail: otpData?.user?.email,
          error: otpError?.message 
        });

        if (!otpError && otpData?.user) {
          console.log('✅ Confirmação bem-sucedida via verifyOtp');
          
          setStatus('success');
          setMessage('Email confirmado com sucesso! Você foi logado automaticamente.');
          setUserData({ email: otpData.user.email || '' });

          // Mostrar toast de sucesso
          toast({
            title: "Email Confirmado!",
            description: "Sua conta foi ativada com sucesso. Bem-vindo ao UTI dos Games!",
          });

          // Auto-redirecionar após 3 segundos
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          
          return;
        }

        // Método 2: Tentar exchangeCodeForSession (para códigos PKCE)
        console.log('🔄 Tentativa 2: exchangeCodeForSession');
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(codigo);
        
        console.log('🔄 Resultado exchangeCodeForSession:', { 
          success: !sessionError, 
          hasUser: !!sessionData?.user, 
          userEmail: sessionData?.user?.email,
          error: sessionError?.message 
        });

        if (!sessionError && sessionData?.user) {
          console.log('✅ Confirmação bem-sucedida via exchangeCodeForSession');
          
          setStatus('success');
          setMessage('Email confirmado com sucesso! Você foi logado automaticamente.');
          setUserData({ email: sessionData.user.email || '' });

          // Mostrar toast de sucesso
          toast({
            title: "Email Confirmado!",
            description: "Sua conta foi ativada com sucesso. Bem-vindo ao UTI dos Games!",
          });

          // Auto-redirecionar após 3 segundos
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
          
          return;
        }

        // Se ambos os métodos falharam
        console.error('❌ Ambos os métodos de confirmação falharam');
        console.error('❌ Erro verifyOtp:', otpError?.message);
        console.error('❌ Erro exchangeCodeForSession:', sessionError?.message);
        
        setStatus('error');
        setMessage(
          'Link de confirmação inválido ou expirado. ' +
          'Tente solicitar um novo email de confirmação ou entre em contato com o suporte.'
        );

      } catch (error: any) {
        console.error('❌ Erro inesperado na confirmação:', error);
        setStatus('error');
        setMessage('Erro interno do sistema. Tente novamente mais tarde ou entre em contato com o suporte.');
      }
    };

    // Aguardar um pouco para garantir que o Supabase está pronto
    const timer = setTimeout(confirmarEmail, 100);
    
    return () => clearTimeout(timer);
  }, [codigo, navigate, toast]);

  const handleVoltar = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {status === 'loading' && 'Confirmando Email...'}
            {status === 'success' && 'Email Confirmado!'}
            {status === 'error' && 'Erro na Confirmação'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">
                Verificando seu email, aguarde um momento...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-green-700">
                  Conta ativada com sucesso!
                </p>
                <p className="text-muted-foreground">
                  Bem-vindo ao <strong>UTI dos Games</strong>!
                </p>
                {userData?.email && (
                  <p className="text-sm text-muted-foreground">
                    Email: {userData.email}
                  </p>
                )}
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">
                  Você será redirecionado automaticamente em alguns segundos...
                </p>
              </div>
              <Button onClick={handleVoltar} className="w-full">
                Ir para o Site Agora
              </Button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-red-700">
                  Erro na Confirmação
                </p>
                <p className="text-muted-foreground">
                  {message}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">
                  Tente solicitar um novo email de confirmação ou entre em contato com o suporte.
                </p>
              </div>
              <Button onClick={handleVoltar} variant="outline" className="w-full">
                Voltar ao Site
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmarConta;