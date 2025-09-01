import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EmailWebhookSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const webhookUrl = `${window.location.origin.replace('http://', 'https://')}/functions/v1/send-custom-emails`;
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copiado!',
        description: 'URL copiada para área de transferência.',
      });
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar a URL.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Configuração do Webhook</h3>
        <p className="text-sm text-muted-foreground">
          Configure o webhook do Supabase para usar os templates personalizados.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Esta configuração deve ser feita apenas uma vez. Após configurar, todos os emails de 
          confirmação, boas-vindas e redefinição de senha usarão os templates personalizados.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Passo 1: URL do Webhook</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardTitle>
          <CardDescription>
            Copie a URL abaixo e configure no painel do Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm font-mono break-all">
              {webhookUrl}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(webhookUrl)}
              className="flex items-center gap-1"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Passo 2: Configurar no Supabase</span>
            <ExternalLink className="w-5 h-5" />
          </CardTitle>
          <CardDescription>
            Siga os passos abaixo no painel do Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                1
              </span>
              <div>
                <p className="font-medium">Acesse o painel do Supabase</p>
                <p className="text-sm text-muted-foreground">
                  Vá para Authentication → Settings → Auth Hooks
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                2
              </span>
              <div>
                <p className="font-medium">Configure o Send Email Hook</p>
                <p className="text-sm text-muted-foreground">
                  Cole a URL copiada acima no campo "Send Email Hook"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-sm font-medium rounded-full">
                3
              </span>
              <div>
                <p className="font-medium">Salve as configurações</p>
                <p className="text-sm text-muted-foreground">
                  Clique em "Save" para ativar o webhook personalizado
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => window.open('https://supabase.com/dashboard/project/pmxnfpnnvtuuiedoxuxc/auth/hooks', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir Painel do Supabase
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos Suportados</CardTitle>
          <CardDescription>
            Os seguintes eventos do Supabase Auth serão processados pelos templates personalizados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Email de Confirmação</p>
                <p className="text-sm text-muted-foreground">
                  Quando um usuário se cadastra (signup)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div>
                <p className="font-medium">Redefinir Senha</p>
                <p className="text-sm text-muted-foreground">
                  Quando um usuário solicita recuperação de senha (recovery)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div>
                <p className="font-medium">Email de Boas-vindas</p>
                <p className="text-sm text-muted-foreground">
                  Enviado automaticamente após confirmação (se habilitado)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Dica:</strong> Após configurar o webhook, teste o sistema criando uma nova conta ou 
          solicitando recuperação de senha. Use a aba "Testes" para verificar se os templates estão 
          funcionando corretamente.
        </AlertDescription>
      </Alert>
    </div>
  );
};