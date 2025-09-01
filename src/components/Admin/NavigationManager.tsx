import React, { useState, useEffect } from 'react';
import { useNavigationItems } from '@/hooks/useNavigationItems';
import { NavigationItem, CreateNavigationItemData, UpdateNavigationItemData } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const NavigationManager = () => {
  const { items, loading, error, createItem, updateItem, deleteItem, toggleVisibility, reorderItems, refresh } = useNavigationItems();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [formData, setFormData] = useState<Partial<CreateNavigationItemData>>({
    title: '',
    slug: '',
    icon_url: '',
    icon_type: 'emoji',
    background_color: '#6366f1',
    text_color: '#ffffff',
    hover_background_color: '#4f46e5',
    hover_text_color: '#ffffff',
    link_url: '',
    link_type: 'internal',
    display_order: 0,
    is_visible: true,
    is_active: true,
    // Configurações padrão da linha de hover
    line_color: '#ffffff',
    line_height: 2,
    line_animation_duration: 0.3,
    show_line: true
  });

  useEffect(() => {
    if (items.length > 0) {
      const maxOrder = Math.max(...items.map(item => item.display_order));
      setFormData(prev => ({ ...prev, display_order: maxOrder + 1 }));
    }
  }, [items]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.link_url) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingItem) {
        const { error } = await updateItem({ 
          id: editingItem.id, 
          ...formData 
        } as UpdateNavigationItemData);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Item atualizado com sucesso!"
        });
        setEditingItem(null);
      } else {
        const { error } = await createItem(formData as CreateNavigationItemData);
        
        if (error) throw error;
        
        toast({
          title: "Sucesso", 
          description: "Item criado com sucesso!"
        });
        setIsCreateDialogOpen(false);
      }
      
      resetForm();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao salvar item",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este item?')) return;
    
    try {
      const { error } = await deleteItem(id);
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Item deletado com sucesso!"
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao deletar item",
        variant: "destructive"
      });
    }
  };

  const handleToggleVisibility = async (id: string, isVisible: boolean) => {
    try {
      const { error } = await toggleVisibility(id, !isVisible);
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: `Item ${!isVisible ? 'mostrado' : 'ocultado'} com sucesso!`
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message || "Erro ao alterar visibilidade",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      icon_url: '',
      icon_type: 'emoji',
      background_color: '#6366f1',
      text_color: '#ffffff',
      hover_background_color: '#4f46e5',
      hover_text_color: '#ffffff',
      link_url: '',
      link_type: 'internal',
      display_order: 0,
      is_visible: true,
      is_active: true,
      // Configurações padrão da linha de hover
      line_color: '#ffffff',
      line_height: 2,
      line_animation_duration: 0.3,
      show_line: true
    });
  };

  const startEdit = (item: NavigationItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      icon_url: item.icon_url,
      icon_type: item.icon_type,
      background_color: item.background_color,
      text_color: item.text_color,
      hover_background_color: item.hover_background_color,
      hover_text_color: item.hover_text_color,
      link_url: item.link_url,
      link_type: item.link_type,
      display_order: item.display_order,
      is_visible: item.is_visible,
      is_active: item.is_active,
      // Configurações da linha de hover com fallbacks
      line_color: item.line_color || '#ffffff',
      line_height: item.line_height || 2,
      line_animation_duration: item.line_animation_duration || 0.3,
      show_line: item.show_line !== undefined ? item.show_line : true
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 p-4">
        Erro ao carregar itens: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Navegação</h2>
          <p className="text-gray-400">Configure os itens do menu de navegação principal</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#2C2C44] border-[#343A40] text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Item de Navegação</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure um novo item para o menu de navegação
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: PlayStation"
                    className="bg-[#1A1A2E] border-[#343A40] text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Ex: playstation"
                    className="bg-[#1A1A2E] border-[#343A40] text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon_type">Tipo de Ícone</Label>
                  <Select 
                    value={formData.icon_type} 
                    onValueChange={(value: 'image' | 'emoji' | 'icon') => 
                      setFormData(prev => ({ ...prev, icon_type: value, icon_url: '' }))
                    }
                  >
                    <SelectTrigger className="bg-[#1A1A2E] border-[#343A40] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2C2C44] border-[#343A40]">
                      <SelectItem value="emoji">Emoji</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="icon">Ícone CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  {formData.icon_type === 'image' ? (
                    <div>
                      <Label>Upload de Ícone</Label>
                      <ImageUpload
                        onImageUploaded={(url) => setFormData(prev => ({ ...prev, icon_url: url }))}
                        currentImage={formData.icon_url}
                        label="Ícone da Navegação"
                        folder="navigation-icons"
                        className="mt-2"
                      />
                      {formData.icon_url && (
                        <div className="mt-2 p-2 bg-[#1A1A2E] rounded border border-[#343A40]">
                          <img 
                            src={formData.icon_url} 
                            alt="Preview" 
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="icon_url">
                        {formData.icon_type === 'emoji' ? 'Emoji' : 'Classe CSS'} *
                      </Label>
                      <Input
                        id="icon_url"
                        value={formData.icon_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                        placeholder={formData.icon_type === 'emoji' ? '🎮' : 'fas fa-gamepad'}
                        className="bg-[#1A1A2E] border-[#343A40] text-white"
                      />
                      {formData.icon_url && formData.icon_type === 'emoji' && (
                        <div className="mt-2 p-2 bg-[#1A1A2E] rounded border border-[#343A40] text-center">
                          <span className="text-2xl">{formData.icon_url}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="background_color">Cor de Fundo</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                    className="bg-[#1A1A2E] border-[#343A40] h-10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hover_background_color">Cor de Fundo (Hover)</Label>
                  <Input
                    id="hover_background_color"
                    type="color"
                    value={formData.hover_background_color}
                    onChange={(e) => setFormData(prev => ({ ...prev, hover_background_color: e.target.value }))}
                    className="bg-[#1A1A2E] border-[#343A40] h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="link_url">URL de Destino *</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                    placeholder="/playstation ou https://..."
                    className="bg-[#1A1A2E] border-[#343A40] text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="link_type">Tipo de Link</Label>
                  <Select 
                    value={formData.link_type} 
                    onValueChange={(value: 'internal' | 'external') => 
                      setFormData(prev => ({ ...prev, link_type: value }))
                    }
                  >
                    <SelectTrigger className="bg-[#1A1A2E] border-[#343A40] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2C2C44] border-[#343A40]">
                      <SelectItem value="internal">Interno</SelectItem>
                      <SelectItem value="external">Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                  />
                  <Label htmlFor="is_visible">Visível</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Ativo</Label>
                </div>
              </div>

              <Separator className="bg-[#343A40]" />
              
              {/* Configurações da Linha de Hover */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Configurações da Linha de Hover</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show_line"
                    checked={formData.show_line}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_line: checked }))}
                  />
                  <Label htmlFor="show_line">Mostrar linha no hover</Label>
                </div>

                {formData.show_line && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="line_color">Cor da Linha</Label>
                      <Input
                        id="line_color"
                        type="color"
                        value={formData.line_color}
                        onChange={(e) => setFormData(prev => ({ ...prev, line_color: e.target.value }))}
                        className="bg-[#1A1A2E] border-[#343A40] h-10"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="line_height">Altura (px)</Label>
                      <Input
                        id="line_height"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.line_height}
                        onChange={(e) => setFormData(prev => ({ ...prev, line_height: parseInt(e.target.value) || 2 }))}
                        className="bg-[#1A1A2E] border-[#343A40] text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="line_animation_duration">Duração (s)</Label>
                      <Input
                        id="line_animation_duration"
                        type="number"
                        min="0.1"
                        max="2"
                        step="0.1"
                        value={formData.line_animation_duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, line_animation_duration: parseFloat(e.target.value) || 0.3 }))}
                        className="bg-[#1A1A2E] border-[#343A40] text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-[#343A40] text-gray-300 hover:bg-[#343A40]"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Criar Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items List */}
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="bg-[#2C2C44] border-[#343A40]">
            <CardContent className="p-4">
              {editingItem?.id === item.id ? (
                // Edit Form
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Básicas */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Informações Básicas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-title-${item.id}`}>Título</Label>
                        <Input
                          id={`edit-title-${item.id}`}
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="bg-[#1A1A2E] border-[#343A40] text-white"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`edit-link-${item.id}`}>Link</Label>
                        <Input
                          id={`edit-link-${item.id}`}
                          value={formData.link_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                          className="bg-[#1A1A2E] border-[#343A40] text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor={`edit-link-type-${item.id}`}>Tipo de Link</Label>
                        <Select 
                          value={formData.link_type} 
                          onValueChange={(value: 'internal' | 'external') => 
                            setFormData(prev => ({ ...prev, link_type: value }))
                          }
                        >
                          <SelectTrigger className="bg-[#1A1A2E] border-[#343A40] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2C2C44] border-[#343A40]">
                            <SelectItem value="internal">Interno</SelectItem>
                            <SelectItem value="external">Externo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`edit-display-order-${item.id}`}>Ordem de Exibição</Label>
                        <Input
                          id={`edit-display-order-${item.id}`}
                          type="number"
                          value={formData.display_order}
                          onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                          className="bg-[#1A1A2E] border-[#343A40] text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-[#343A40]" />

                  {/* Configuração de Ícone */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Configuração de Ícone</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-icon-type-${item.id}`}>Tipo de Ícone</Label>
                        <Select 
                          value={formData.icon_type} 
                          onValueChange={(value: 'image' | 'emoji' | 'icon') => 
                            setFormData(prev => ({ ...prev, icon_type: value, icon_url: '' }))
                          }
                        >
                          <SelectTrigger className="bg-[#1A1A2E] border-[#343A40] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2C2C44] border-[#343A40]">
                            <SelectItem value="emoji">Emoji</SelectItem>
                            <SelectItem value="image">Imagem</SelectItem>
                            <SelectItem value="icon">Ícone CSS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        {formData.icon_type === 'image' ? (
                          <div>
                            <Label>Upload de Ícone</Label>
                            <ImageUpload
                              onImageUploaded={(url) => setFormData(prev => ({ ...prev, icon_url: url }))}
                              currentImage={formData.icon_url}
                              label="Ícone da Navegação"
                              folder="navigation-icons"
                              className="mt-2"
                            />
                            {formData.icon_url && (
                              <div className="mt-2 p-2 bg-[#1A1A2E] rounded border border-[#343A40]">
                                <img 
                                  src={formData.icon_url} 
                                  alt="Preview" 
                                  className="w-8 h-8 object-contain"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor={`edit-icon-${item.id}`}>
                              {formData.icon_type === 'emoji' ? 'Emoji' : 'Classe CSS'}
                            </Label>
                            <Input
                              id={`edit-icon-${item.id}`}
                              value={formData.icon_url}
                              onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                              placeholder={formData.icon_type === 'emoji' ? '🎮' : 'fas fa-gamepad'}
                              className="bg-[#1A1A2E] border-[#343A40] text-white"
                            />
                            {formData.icon_url && formData.icon_type === 'emoji' && (
                              <div className="mt-2 p-2 bg-[#1A1A2E] rounded border border-[#343A40] text-center">
                                <span className="text-2xl">{formData.icon_url}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-[#343A40]" />

                  {/* Configuração de Cores */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Configuração de Cores</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`edit-bg-color-${item.id}`}>Cor de Fundo</Label>
                        <Input
                          id={`edit-bg-color-${item.id}`}
                          type="color"
                          value={formData.background_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                          className="bg-[#1A1A2E] border-[#343A40] h-10"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`edit-text-color-${item.id}`}>Cor do Texto</Label>
                        <Input
                          id={`edit-text-color-${item.id}`}
                          type="color"
                          value={formData.text_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                          className="bg-[#1A1A2E] border-[#343A40] h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-[#343A40]" />

                  {/* Configuração da Linha de Hover */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Configuração da Linha de Hover</h3>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <Switch
                        id={`show_line-${item.id}`}
                        checked={formData.show_line}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_line: checked }))}
                      />
                      <Label htmlFor={`show_line-${item.id}`}>Mostrar linha no hover</Label>
                    </div>

                    {formData.show_line && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`line_color-${item.id}`}>Cor da Linha</Label>
                          <Input
                            id={`line_color-${item.id}`}
                            type="color"
                            value={formData.line_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, line_color: e.target.value }))}
                            className="bg-[#1A1A2E] border-[#343A40] h-10"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`line_height-${item.id}`}>Altura da Linha (px)</Label>
                          <Input
                            id={`line_height-${item.id}`}
                            type="number"
                            min="1"
                            max="10"
                            value={formData.line_height}
                            onChange={(e) => setFormData(prev => ({ ...prev, line_height: parseInt(e.target.value) }))}
                            className="bg-[#1A1A2E] border-[#343A40] text-white"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`line_animation_duration-${item.id}`}>Duração Animação (s)</Label>
                          <Input
                            id={`line_animation_duration-${item.id}`}
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="2.0"
                            value={formData.line_animation_duration}
                            onChange={(e) => setFormData(prev => ({ ...prev, line_animation_duration: parseFloat(e.target.value) }))}
                            className="bg-[#1A1A2E] border-[#343A40] text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-[#343A40]" />

                  {/* Configurações de Visibilidade */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Configurações de Visibilidade</h3>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`is_visible-${item.id}`}
                        checked={formData.is_visible}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
                      />
                      <Label htmlFor={`is_visible-${item.id}`}>Item visível no menu</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={cancelEdit} size="sm">
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-1" />
                      Salvar
                    </Button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">#{item.display_order}</span>
                    </div>
                    
                    <div 
                      className="px-3 py-1 rounded text-sm font-medium flex items-center space-x-2"
                      style={{ 
                        backgroundColor: item.background_color,
                        color: item.text_color 
                      }}
                    >
                      <span>{item.icon_url}</span>
                      <span>{item.title}</span>
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      → {item.link_url}
                    </div>
                    
                    <div className="flex space-x-1">
                      {item.is_visible ? (
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                          Visível
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-600/20 text-red-400">
                          Oculto
                        </Badge>
                      )}
                      
                      {item.link_type === 'external' && (
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          Externo
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleVisibility(item.id, item.is_visible)}
                      className="text-gray-400 hover:text-white"
                    >
                      {item.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(item)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card className="bg-[#2C2C44] border-[#343A40]">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">Nenhum item de navegação encontrado.</p>
            <p className="text-sm text-gray-500 mt-2">Clique em "Novo Item" para começar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

