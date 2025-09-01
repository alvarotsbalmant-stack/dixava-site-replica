import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AdminAutoLogin = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processando login automático...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    const processAutoLogin = async () => {
      if (hasProcessed.current || !token) {
        if (!token) {
          setStatus('error');
          setMessage('Token não encontrado na URL');
        }
        return;
      }

      hasProcessed.current = true;

      try {
        console.log('🚀 Iniciando processo de auto-login com token:', token);
        setMessage('Validando token administrativo...');
        
        // Fazer logout primeiro para garantir sessão limpa
        await signOut();
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('📞 Chamando edge function admin-auto-login');

        const { data, error } = await supabase.functions.invoke('admin-auto-login', {
          body: { 
            token: token,
            clientIP: null
          }
        });

        console.log('📋 Resposta da edge function:', { data, error });

        if (error) {
          console.error('❌ Erro na edge function:', error);
          throw new Error(`Erro na comunicação: ${error.message}`);
        }

        if (!data?.success) {
          console.error('❌ Edge function retornou falha:', data?.message);
          throw new Error(data?.message || 'Falha na validação do token');
        }

        console.log('✅ Token validado com sucesso');
        setMessage('Criando sessão administrativa...');

        if (!data.sessionTokens?.access_token || !data.sessionTokens?.refresh_token) {
          console.error('❌ Tokens não recebidos');
          throw new Error('Tokens de autenticação não foram recebidos');
        }

        console.log('🔑 Estabelecendo sessão com tokens recebidos...');
        
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.sessionTokens.access_token,
          refresh_token: data.sessionTokens.refresh_token
        });

        if (sessionError) {
          console.error('❌ Erro ao estabelecer sessão:', sessionError);
          throw new Error(`Erro ao estabelecer sessão: ${sessionError.message}`);
        }

        if (!sessionData.session) {
          console.error('❌ Sessão não foi estabelecida');
          throw new Error('Sessão não foi estabelecida corretamente');
        }

        console.log('✅ Sessão administrativa estabelecida com sucesso!');
        console.log('👤 Admin logado:', {
          id: sessionData.session.user.id,
          email: sessionData.session.user.email
        });
        
        // Marcar que esta sessão foi estabelecida via auto-login
        localStorage.setItem('admin_auto_login_session', 'true');
        
        setStatus('success');
        setMessage('✅ Login realizado com sucesso! Redirecionando...');
        
        toast.success('Login administrativo realizado com sucesso!');
        
        // Aguardar e redirecionar
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('🔄 Redirecionando para /admin...');
        navigate('/admin', { replace: true });

      } catch (error: any) {
        console.error('❌ Erro no processo de auto-login:', error);
        setStatus('error');
        setMessage(error.message || 'Erro desconhecido no processo de login');
        
        toast.error('Erro no login automático');
        
        // Redirecionar para home após erro
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    processAutoLogin();
  }, [token, navigate, signOut]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          {status === 'processing' && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h1 className="text-2xl font-bold text-white">Login Administrativo</h1>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h1 className="text-2xl font-bold text-white">Login Realizado!</h1>
            </>
          )}
          
          {status === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold text-white">Erro no Login</h1>
            </>
          )}
          
          <p className="text-gray-400 max-w-md">
            {message}
          </p>
          
          {status === 'error' && (
            <p className="text-sm text-gray-500">
              Você será redirecionado para a página inicial em alguns segundos...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};