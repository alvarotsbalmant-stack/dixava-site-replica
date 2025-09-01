import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const [isResending, setIsResending] = React.useState(false);

  // Se não há usuário logado, renderizar normalmente
  if (!user) {
    return <>{children}</>;
  }

  // Se o email já foi confirmado, renderizar normalmente
  if (user.email_confirmed_at) {
    return <>{children}</>;
  }

  // Função para reenviar email de confirmação
  const handleResendEmail = async () => {
    if (!user.email) return;
    
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: "Email reenviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  // Se o email não foi confirmado, mostrar tela de verificação
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Confirme seu Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Enviamos um link de confirmação para:
            </p>
            <p className="font-medium text-primary">
              {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              Clique no link no email para ativar sua conta e acessar o site.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Não recebeu o email?</strong>
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Verifique sua caixa de spam/lixo eletrônico</li>
              <li>• Aguarde alguns minutos para o email chegar</li>
              <li>• Solicite um novo email abaixo</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full"
              variant="outline"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar Email
                </>
              )}
            </Button>

            <Button 
              onClick={signOut}
              variant="ghost"
              className="w-full"
            >
              Sair e tentar com outra conta
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Problemas? Entre em contato com nosso suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};