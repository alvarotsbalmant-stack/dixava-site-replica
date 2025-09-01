import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import usePlatforms, { Platform } from '@/hooks/usePlatforms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Gamepad2, Eye, EyeOff, MoveUp, MoveDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';

const PlatformManager: React.FC = () => {
  const { toast } = useToast();
  const { platforms, loading, createPlatform, updatePlatform, deletePlatform } = usePlatforms();
  
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon_url: '',
    icon_emoji: '🎮',
    color: '#000000',
    is_active: true,
    display_order: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon_url: '',
      icon_emoji: '🎮',
      color: '#000000',
      is_active: true,
      display_order: platforms.length
    });
  };

  const handleCreatePlatform = async () => {
    try {
      await createPlatform({
        ...formData,
        display_order: platforms.length
      });
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao criar plataforma:', error);
    }
  };

  const handleEditPlatform = async () => {
    if (!selectedPlatform) return;

    try {
      await updatePlatform(selectedPlatform.id, formData);
      setShowEditDialog(false);
      setSelectedPlatform(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao atualizar plataforma:', error);
    }
  };

  const handleDeletePlatform = async (platform: Platform) => {
    try {
      await deletePlatform(platform.id);
    } catch (error) {
      console.error('Erro ao deletar plataforma:', error);
    }
  };

  const openEditDialog = (platform: Platform) => {
    setSelectedPlatform(platform);
    setFormData({
      name: platform.name,
      slug: platform.slug,
      icon_url: platform.icon_url || '',
      icon_emoji: platform.icon_emoji,
      color: platform.color,
      is_active: platform.is_active,
      display_order: platform.display_order
    });
    setShowEditDialog(true);
  };

  const handleToggleActive = async (platform: Platform) => {
    await updatePlatform(platform.id, { 
      is_active: !platform.is_active 
    });
  };

  const movePosition = async (platform: Platform, direction: 'up' | 'down') => {
    const sortedPlatforms = [...platforms].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sortedPlatforms.findIndex(p => p.id === platform.id);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetPlatform = sortedPlatforms[currentIndex - 1];
      await updatePlatform(platform.id, { display_order: targetPlatform.display_order });
      await updatePlatform(targetPlatform.id, { display_order: platform.display_order });
    } else if (direction === 'down' && currentIndex < sortedPlatforms.length - 1) {
      const targetPlatform = sortedPlatforms[currentIndex + 1];
      await updatePlatform(platform.id, { display_order: targetPlatform.display_order });
      await updatePlatform(targetPlatform.id, { display_order: platform.display_order });
    }
  };

  // Gerar slug automaticamente baseado no nome
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Gerenciar Plataformas
          </h2>
          <p className="text-gray-400">
            Configure as plataformas disponíveis no sistema
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Plataforma
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Plataforma</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: PlayStation 5"
                />
              </div>

              <div>
                <Label htmlFor="slug">Identificador (Slug) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="Ex: playstation-5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon_emoji">Emoji</Label>
                  <Input
                    id="icon_emoji"
                    value={formData.icon_emoji}
                    onChange={(e) => setFormData({...formData, icon_emoji: e.target.value})}
                    placeholder="🎮"
                  />
                </div>
                
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                  />
                </div>
              </div>

              <ImageUpload
                onImageUploaded={(url) => setFormData({...formData, icon_url: url})}
                currentImage={formData.icon_url}
                label="Ícone da Plataforma"
                folder="platform-icons"
                className="col-span-2"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePlatform} disabled={!formData.name || !formData.slug}>
                  Criar Plataforma
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Plataformas */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-400">Carregando plataformas...</p>
            </CardContent>
          </Card>
        ) : platforms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Gamepad2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Nenhuma plataforma cadastrada</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Plataforma
              </Button>
            </CardContent>
          </Card>
        ) : (
          platforms
            .sort((a, b) => a.display_order - b.display_order)
            .map((platform) => (
              <Card key={platform.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {platform.icon_url ? (
                          <img 
                            src={platform.icon_url} 
                            alt={platform.name} 
                            className="w-8 h-8 object-contain rounded"
                          />
                        ) : (
                          <span className="text-2xl">{platform.icon_emoji}</span>
                        )}
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: platform.color }}
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{platform.name}</h3>
                          {platform.is_active ? (
                            <Badge className="bg-green-500">
                              <Eye className="w-3 h-3 mr-1" />
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inativa
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1">
                          <p>Slug: {platform.slug}</p>
                          <p>Ordem: {platform.display_order}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Toggle Ativo/Inativo */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${platform.id}`} className="text-sm text-gray-400">
                          Ativo
                        </Label>
                        <Switch
                          id={`active-${platform.id}`}
                          checked={platform.is_active}
                          onCheckedChange={() => handleToggleActive(platform)}
                        />
                      </div>

                      {/* Controles de Posição */}
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => movePosition(platform, 'up')}
                          className="h-6 w-6 p-0"
                        >
                          <MoveUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => movePosition(platform, 'down')}
                          className="h-6 w-6 p-0"
                        >
                          <MoveDown className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(platform)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a plataforma "{platform.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeletePlatform(platform)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Plataforma</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="edit-slug">Identificador (Slug) *</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-icon_emoji">Emoji</Label>
                <Input
                  id="edit-icon_emoji"
                  value={formData.icon_emoji}
                  onChange={(e) => setFormData({...formData, icon_emoji: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-color">Cor</Label>
                <Input
                  id="edit-color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                />
              </div>
            </div>

            <ImageUpload
              onImageUploaded={(url) => setFormData({...formData, icon_url: url})}
              currentImage={formData.icon_url}
              label="Ícone da Plataforma"
              folder="platform-icons"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditPlatform} disabled={!formData.name || !formData.slug}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformManager;