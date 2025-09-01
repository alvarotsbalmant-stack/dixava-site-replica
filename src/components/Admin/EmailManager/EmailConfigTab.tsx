import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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

export const EmailConfigTab: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfig(data);
      } else {
        // Criar configuração padrão se não existir
        const defaultConfig = {
          from_name: 'Sua Empresa',
          from_email: 'noreply@suaempresa.com',
          primary_color: '#2563eb',
          secondary_color: '#f8fafc',
        };
        
        const { data: newConfig, error: insertError } = await supabase
          .from('email_config')
          .insert(defaultConfig)
          .select()
          .single();
          
        if (insertError) throw insertError;
        setConfig(newConfig);
      }
    } catch (error) {
      console.error('Error loading email config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar configurações de email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_config')
        .update(config)
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Configurações de email salvas com sucesso!',
      });
    } catch (error) {
      console.error('Error saving email config:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EmailConfig, value: string) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (loading) {
    return <div className="text-center py-8">Carregando configurações...</div>;
  }

  if (!config) {
    return <div className="text-center py-8">Erro ao carregar configurações.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Configurações Gerais de Email</h3>
        <p className="text-sm text-muted-foreground">
          Configure as informações básicas que serão usadas em todos os emails.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Remetente</CardTitle>
          <CardDescription>
            Configure o nome e email que aparecerão como remetente dos emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">Nome do Remetente</Label>
              <Input
                id="from-name"
                value={config.from_name}
                onChange={(e) => handleInputChange('from_name', e.target.value)}
                placeholder="Sua Empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">Email do Remetente</Label>
              <Input
                id="from-email"
                type="email"
                value={config.from_email}
                onChange={(e) => handleInputChange('from_email', e.target.value)}
                placeholder="noreply@suaempresa.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply-to">Email de Resposta (Opcional)</Label>
            <Input
              id="reply-to"
              type="email"
              value={config.reply_to || ''}
              onChange={(e) => handleInputChange('reply_to', e.target.value)}
              placeholder="contato@suaempresa.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Identidade Visual</CardTitle>
          <CardDescription>
            Configure logo, cores e informações da empresa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo-url">URL do Logo</Label>
            <Input
              id="logo-url"
              type="url"
              value={config.logo_url || ''}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  value={config.primary_color}
                  onChange={(e) => handleInputChange('primary_color', e.target.value)}
                  placeholder="#2563eb"
                />
                <div
                  className="w-10 h-10 border rounded"
                  style={{ backgroundColor: config.primary_color }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  value={config.secondary_color}
                  onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                  placeholder="#f8fafc"
                />
                <div
                  className="w-10 h-10 border rounded"
                  style={{ backgroundColor: config.secondary_color }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-address">Endereço da Empresa (Opcional)</Label>
            <Textarea
              id="company-address"
              value={config.company_address || ''}
              onChange={(e) => handleInputChange('company_address', e.target.value)}
              placeholder="Rua Exemplo, 123 - Cidade, Estado - CEP 12345-678"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Preview da Configuração
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Ocultar' : 'Mostrar'} Preview
            </Button>
          </CardTitle>
          <CardDescription>
            Visualize como as configurações serão aplicadas nos emails.
          </CardDescription>
        </CardHeader>
        {showPreview && (
          <CardContent>
            <div
              className="border rounded-lg p-6"
              style={{ backgroundColor: config.secondary_color }}
            >
              <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
                {config.logo_url && (
                  <div className="text-center mb-4">
                    <img
                      src={config.logo_url}
                      alt={config.from_name}
                      className="max-w-32 h-auto mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <h1
                  className="text-xl font-bold text-center mb-4"
                  style={{ color: config.primary_color }}
                >
                  Exemplo de Email
                </h1>
                
                <p className="text-gray-600 mb-4">
                  Este é um exemplo de como seus emails aparecerão com as configurações atuais.
                </p>
                
                <div className="text-center mb-4">
                  <button
                    className="px-6 py-2 text-white rounded font-medium"
                    style={{ backgroundColor: config.primary_color }}
                  >
                    Botão de Ação
                  </button>
                </div>
                
                {config.company_address && (
                  <div className="border-t pt-4 mt-4 text-center text-xs text-gray-500">
                    <p>{config.from_name}</p>
                    <p>{config.company_address}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};