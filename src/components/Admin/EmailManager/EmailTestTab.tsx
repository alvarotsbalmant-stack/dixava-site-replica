import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sanitizeHtml } from '@/lib/sanitizer';

interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: any;
  is_active: boolean;
}

interface EmailConfig {
  id: string;
  from_name: string;
  from_email: string;
  reply_to?: string;
  logo_url?: string;
  company_address?: string;
  primary_color: string;
  secondary_color: string;
}

export const EmailTestTab: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [testEmail, setTestEmail] = useState('');
  const [testVariables, setTestVariables] = useState('{}');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesResult, configResult] = await Promise.all([
        supabase.from('email_templates').select('*').eq('is_active', true),
        supabase.from('email_config').select('*').single()
      ]);

      if (templatesResult.error) throw templatesResult.error;
      if (configResult.error) throw configResult.error;

      setTemplates(templatesResult.data || []);
      setConfig(configResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados para teste.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail || !config) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      // Parse das variáveis de teste
      let variables = {};
      try {
        variables = JSON.parse(testVariables);
      } catch (e) {
        toast({
          title: 'Erro',
          description: 'JSON de variáveis inválido.',
          variant: 'destructive',
        });
        setSending(false);
        return;
      }

      // Chamar a edge function de teste
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          template_id: selectedTemplate,
          recipient_email: testEmail,
          test_variables: {
            ...variables,
            platform_url: window.location.origin
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: data.message || `Email de teste enviado para ${testEmail}!`,
      });

    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar email de teste.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getTemplateVariables = (template: EmailTemplate): string[] => {
    if (Array.isArray(template.variables)) {
      return template.variables;
    }
    if (typeof template.variables === 'string') {
      try {
        return JSON.parse(template.variables);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  if (loading) {
    return <div className="text-center py-8">Carregando dados para teste...</div>;
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const templateVariables = selectedTemplateData ? getTemplateVariables(selectedTemplateData) : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Testar Envio de Emails</h3>
        <p className="text-sm text-muted-foreground">
          Envie emails de teste para verificar se os templates estão funcionando corretamente.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Os emails de teste usarão as configurações reais do sistema. 
          Certifique-se de que a chave API do Resend está configurada corretamente.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configurar Teste</CardTitle>
          <CardDescription>
            Selecione um template e configure os dados para o teste.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-select">Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-email">Email de Teste</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
              />
            </div>
          </div>

          {selectedTemplateData && (
            <div className="space-y-2">
              <Label htmlFor="test-variables">Variáveis de Teste (JSON)</Label>
              <Textarea
                id="test-variables"
                value={testVariables}
                onChange={(e) => setTestVariables(e.target.value)}
                placeholder={`{
  "user_name": "João Silva",
  "platform_url": "${window.location.origin}"
}`}
                className="min-h-[100px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Variáveis disponíveis neste template: {templateVariables.join(', ')}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleSendTest} 
              disabled={sending || !selectedTemplate || !testEmail}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Enviando...' : 'Enviar Teste'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedTemplateData && (
        <Card>
          <CardHeader>
            <CardTitle>Preview do Template Selecionado</CardTitle>
            <CardDescription>
              {selectedTemplateData.name} - {selectedTemplateData.subject}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Conteúdo HTML:</Label>
                <div 
                  className="border rounded-lg p-4 bg-background max-h-64 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedTemplateData.html_content || '') }}
                />
              </div>
              
              {selectedTemplateData.text_content && (
                <div>
                  <Label>Conteúdo Texto:</Label>
                  <pre className="text-sm whitespace-pre-wrap border rounded-lg p-4 bg-muted max-h-32 overflow-y-auto">
                    {selectedTemplateData.text_content}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {config && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações Atuais</CardTitle>
            <CardDescription>
              Configurações que serão usadas no envio do email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Remetente:</Label>
                <p>{config.from_name} &lt;{config.from_email}&gt;</p>
              </div>
              {config.reply_to && (
                <div>
                  <Label>Responder para:</Label>
                  <p>{config.reply_to}</p>
                </div>
              )}
              <div>
                <Label>Cor Primária:</Label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 border rounded"
                    style={{ backgroundColor: config.primary_color }}
                  />
                  <span>{config.primary_color}</span>
                </div>
              </div>
              {config.logo_url && (
                <div>
                  <Label>Logo:</Label>
                  <img 
                    src={config.logo_url} 
                    alt="Logo" 
                    className="max-w-20 h-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};