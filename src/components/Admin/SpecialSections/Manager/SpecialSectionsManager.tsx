import React, { useState, useCallback } from 'react';
import { Plus, Search, Filter, Eye, EyeOff, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useSpecialSections } from '@/hooks/specialSections/useSpecialSections';
import { SectionEditor } from './SectionEditor';
import { SectionPreview } from './SectionPreview';
import { DragDropList } from '../UI/DragDropList';
import type { SpecialSection, CreateSectionRequest } from '@/hooks/specialSections/useSpecialSections';

const SECTION_TYPE_LABELS = {
  banner_hero: 'Banner Hero',
  product_carousel: 'Carrossel de Produtos',
  category_grid: 'Grid de Categorias',
  promotional_banner: 'Banner Promocional',
  news_section: 'Seção de Notícias',
  custom_html: 'HTML Customizado'
} as const;

const VISIBILITY_LABELS = {
  both: 'Desktop e Mobile',
  desktop_only: 'Apenas Desktop',
  mobile_only: 'Apenas Mobile',
  hidden: 'Oculto'
} as const;

export const SpecialSectionsManager: React.FC = () => {
  // Estados principais
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<SpecialSection | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Hook para gerenciar seções
  const {
    sections,
    loading,
    error,
    total,
    refetch,
    createSection,
    updateSection,
    deleteSection,
    reorderSections
  } = useSpecialSections({
    type: typeFilter === 'all' ? undefined : typeFilter,
    visibility: visibilityFilter === 'all' ? undefined : visibilityFilter
  });

  // Filtrar seções por termo de busca
  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers para ações
  const handleCreateSection = useCallback(() => {
    setSelectedSection(null);
    setIsCreating(true);
    setIsEditorOpen(true);
  }, []);

  const handleEditSection = useCallback((section: SpecialSection) => {
    setSelectedSection(section);
    setIsCreating(false);
    setIsEditorOpen(true);
  }, []);

  const handlePreviewSection = useCallback((section: SpecialSection) => {
    setSelectedSection(section);
    setIsPreviewOpen(true);
  }, []);

  const handleSaveSection = useCallback(async (data: CreateSectionRequest) => {
    try {
      if (isCreating) {
        await createSection(data);
      } else if (selectedSection) {
        await updateSection({ id: selectedSection.id, ...data });
      }
      setIsEditorOpen(false);
      setSelectedSection(null);
    } catch (error) {
      console.error('Erro ao salvar seção:', error);
    }
  }, [isCreating, selectedSection, createSection, updateSection]);

  const handleToggleVisibility = useCallback(async (section: SpecialSection) => {
    try {
      await updateSection({
        id: section.id,
        is_active: !section.is_active
      });
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
    }
  }, [updateSection]);

  const handleDeleteSection = useCallback(async (id: string) => {
    try {
      await deleteSection(id);
      setSectionToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar seção:', error);
    }
  }, [deleteSection]);

  const handleReorder = useCallback(async (items: Array<{ id: string; order: number }>) => {
    try {
      await reorderSections(items);
    } catch (error) {
      console.error('Erro ao reordenar seções:', error);
    }
  }, [reorderSections]);

  // Renderizar item da lista
  const renderSectionItem = useCallback((section: SpecialSection) => (
    <Card key={section.id} className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Drag handle */}
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab group-hover:text-gray-600" />
            
            {/* Informações da seção */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm">{section.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {(section.content_config as any)?.type || 'custom_html'}
                </Badge>
                <Badge 
                  variant={section.is_active ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {section.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                Ordem: {section.display_order || 0} • Criado em {new Date(section.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {/* Toggle visibilidade */}
            <div className="flex items-center gap-1">
              <Switch
                checked={section.is_active}
                onCheckedChange={() => handleToggleVisibility(section)}
              />
              {section.is_active ? (
                <Eye className="h-3 w-3 text-green-600" />
              ) : (
                <EyeOff className="h-3 w-3 text-gray-400" />
              )}
            </div>

            {/* Botões de ação */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePreviewSection(section)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSection(section)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSectionToDelete(section.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ), [handleToggleVisibility, handlePreviewSection, handleEditSection]);

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar seções: {error}</p>
          <Button onClick={refetch}>Tentar Novamente</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seções Especiais</h1>
          <p className="text-gray-600">
            Gerencie as seções especiais da homepage e páginas específicas
          </p>
        </div>
        <Button onClick={handleCreateSection} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Seção
        </Button>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar seções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por tipo */}
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(SECTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por visibilidade */}
            <Select value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as visibilidades</SelectItem>
                {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de seções */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Seções ({filteredSections.length} de {total})
            </CardTitle>
            {loading && (
              <div className="text-sm text-gray-500">Carregando...</div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredSections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm || typeFilter !== 'all' || visibilityFilter !== 'all'
                  ? 'Nenhuma seção encontrada com os filtros aplicados'
                  : 'Nenhuma seção criada ainda'
                }
              </p>
              {!searchTerm && typeFilter === 'all' && visibilityFilter === 'all' && (
                <Button onClick={handleCreateSection} variant="outline">
                  Criar primeira seção
                </Button>
              )}
            </div>
          ) : (
            <DragDropList
              items={filteredSections.map(section => ({ 
                ...section, 
                order: section.display_order || 0,
                type: 'special_section',
                isVisible: section.is_active
              }))}
              onReorder={(items) => handleReorder(items.map(item => ({ id: item.id, order: item.order })))}
              renderItem={renderSectionItem}
              keyExtractor={(item) => item.id}
            />
          )}
        </CardContent>
      </Card>

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Criar Nova Seção' : 'Editar Seção'}
            </DialogTitle>
          </DialogHeader>
          <SectionEditor
            section={selectedSection as any}
            onSave={handleSaveSection}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview da Seção</DialogTitle>
          </DialogHeader>
          {selectedSection && (
            <SectionPreview section={selectedSection as any} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!sectionToDelete} onOpenChange={() => setSectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta seção? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sectionToDelete && handleDeleteSection(sectionToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

