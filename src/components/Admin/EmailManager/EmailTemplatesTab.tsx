import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Eye, Plus, Save, X, Palette, Code } from 'lucide-react';
import { EmailVisualEditor, EmailBlock } from './EmailVisualEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  created_at: string;
  updated_at: string;
  visual_config?: any;
}

export const EmailTemplatesTab: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate>>({});
  const [editMode, setEditMode] = useState<'visual' | 'code'>('visual');
  const [emailConfig, setEmailConfig] = useState<any>(null);
  const { toast } = useToast();

  const templateTypes = [
    { value: 'confirmation', label: 'Email de Confirmação' },
    { value: 'welcome', label: 'Email de Boas-vindas' },
    { value: 'reset_password', label: 'Redefinir Senha' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'follow_up', label: 'Follow-up' },
  ];

  useEffect(() => {
    loadTemplates();
    loadEmailConfig();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('type');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar templates de email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEmailConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setEmailConfig(data);
    } catch (error) {
      console.error('Error loading email config:', error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (!editingTemplate.type || !editingTemplate.name || !editingTemplate.subject || !editingTemplate.html_content) {
        toast({
          title: 'Erro',
          description: 'Preencha todos os campos obrigatórios.',
          variant: 'destructive',
        });
        return;
      }

      const templateData = {
        type: editingTemplate.type,
        name: editingTemplate.name,
        subject: editingTemplate.subject,
        html_content: editingTemplate.html_content,
        text_content: editingTemplate.text_content || '',
        variables: editingTemplate.variables || [],
        visual_config: editingTemplate.visual_config || null,
        is_active: editingTemplate.is_active ?? true,
      };

      let result;
      if (editingTemplate.id) {
        // Update existing template
        result = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);
      } else {
        // Create new template
        result = await supabase
          .from('email_templates')
          .insert(templateData);
      }

      if (result.error) throw result.error;

      toast({
        title: 'Sucesso',
        description: `Template ${editingTemplate.id ? 'atualizado' : 'criado'} com sucesso!`,
      });

      setIsEditDialogOpen(false);
      setEditingTemplate({});
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar template.',
        variant: 'destructive',
      });
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setIsEditDialogOpen(true);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const handleNewTemplate = () => {
    setEditingTemplate({
      type: '',
      name: '',
      subject: '',
      html_content: '',
      text_content: '',
      variables: [],
      visual_config: [] as any,
      is_active: true,
    });
    setEditMode('visual');
    setIsEditDialogOpen(true);
  };

  const handleVisualEditorChange = (blocks: EmailBlock[], html: string) => {
    setEditingTemplate(prev => ({
      ...prev,
      visual_config: blocks as any,
      html_content: html
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Carregando templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Templates de Email</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie templates para diferentes tipos de emails do sistema.
          </p>
        </div>
        <Button onClick={handleNewTemplate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant="outline">
                    {templateTypes.find(t => t.value === template.type)?.label || template.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreviewTemplate(template)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                Assunto: {template.subject}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Variáveis disponíveis: {Array.isArray(template.variables) ? template.variables.join(', ') : 'Nenhuma'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editMode === 'visual' ? <Palette className="w-4 h-4" /> : <Code className="w-4 h-4" />}
              {editingTemplate.id ? 'Editar Template' : 'Novo Template'}
            </DialogTitle>
            <DialogDescription>
              {editMode === 'visual' 
                ? 'Design seu email visualmente usando blocos arrastáveis.'
                : 'Configure o template de email com HTML personalizado e variáveis.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
              <Tabs value={editMode} onValueChange={(value) => setEditMode(value as 'visual' | 'code')}>
                <TabsList>
                  <TabsTrigger value="visual" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Visual
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Código
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-type">Tipo de Template</Label>
                <Select
                  value={editingTemplate.type}
                  onValueChange={(value) => setEditingTemplate(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={editingTemplate.name || ''}
                  onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome descritivo do template"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Assunto do Email</Label>
              <Input
                id="template-subject"
                value={editingTemplate.subject || ''}
                onChange={(e) => setEditingTemplate(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Assunto do email (pode usar variáveis como {{user_name}})"
              />
            </div>

            {/* Content Editor */}
            {editMode === 'visual' ? (
              <div className="space-y-2">
                <Label>Design Visual do Email</Label>
                <EmailVisualEditor
                  initialBlocks={(editingTemplate.visual_config as EmailBlock[]) || []}
                  onChange={handleVisualEditorChange}
                  emailConfig={emailConfig}
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="template-html">Conteúdo HTML</Label>
                  <Textarea
                    id="template-html"
                    value={editingTemplate.html_content || ''}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, html_content: e.target.value }))}
                    placeholder="Conteúdo HTML do email..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-text">Conteúdo Texto (Opcional)</Label>
                  <Textarea
                    id="template-text"
                    value={editingTemplate.text_content || ''}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, text_content: e.target.value }))}
                    placeholder="Versão em texto simples do email..."
                    className="min-h-[100px]"
                  />
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={editingTemplate.is_active ?? true}
                onCheckedChange={(checked) => setEditingTemplate(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Template ativo</Label>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveTemplate}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Visualização do template de email
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Assunto:</Label>
                <p className="text-sm font-medium">{selectedTemplate.subject}</p>
              </div>

              <Separator />

              <div>
                <Label>Conteúdo HTML:</Label>
                <div
                  className="border rounded-lg p-4 bg-background"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedTemplate.html_content || '') }}
                />
              </div>

              {selectedTemplate.text_content && (
                <>
                  <Separator />
                  <div>
                    <Label>Conteúdo Texto:</Label>
                    <pre className="text-sm whitespace-pre-wrap border rounded-lg p-4 bg-muted">
                      {selectedTemplate.text_content}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};