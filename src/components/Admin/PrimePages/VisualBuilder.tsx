import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { GripVertical, Edit, Eye, EyeOff, Trash2, Copy, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductSectionEditor } from './modals/ProductSectionEditor';
import { SpecialSectionEditor } from './modals/SpecialSectionEditor';

interface VisualBuilderProps {
  sections: any[];
  onSectionUpdate: (sectionId: string, updates: any) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionReorder: (newOrder: any[]) => void;
}

export const VisualBuilder: React.FC<VisualBuilderProps> = ({
  sections,
  onSectionUpdate,
  onSectionDelete,
  onSectionReorder
}) => {
  const [editingSection, setEditingSection] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [showSpecialEditor, setShowSpecialEditor] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index
    }));

    onSectionReorder(updatedItems);
  };

  const handleToggleVisibility = async (section: any) => {
    await onSectionUpdate(section.id, { is_visible: !section.is_visible });
  };

  const handleDeleteSection = async (section: any) => {
    if (window.confirm(`Tem certeza que deseja excluir a seção "${getSectionName(section)}"?`)) {
      await onSectionDelete(section.id);
    }
  };

  const handleEditSection = (section: any) => {
    setEditingSection(section);
    
    // Open specific editor based on section type
    if (section.section_type === 'product_section') {
      setShowProductEditor(true);
    } else if (['banner_hero', 'product_carousel', 'custom_banner', 'promo_banner', 'special_section'].includes(section.section_type)) {
      setShowSpecialEditor(true);
    } else {
      // Fallback to generic editor for other types
      setEditForm({
        section_key: section.section_key,
        section_type: section.section_type,
        section_config: { ...section.section_config },
        is_visible: section.is_visible
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSection) return;

    await onSectionUpdate(editingSection.id, editForm);
    setEditingSection(null);
    setEditForm({});
  };

  const handleProductSectionUpdate = async (updatedSection: any) => {
    await onSectionUpdate(editingSection.id, {
      section_key: updatedSection.section_key,
      is_visible: updatedSection.is_visible,
      section_config: updatedSection.section_config
    });
    setEditingSection(null);
    setShowProductEditor(false);
  };

  const handleSpecialSectionUpdate = async (updatedSection: any) => {
    await onSectionUpdate(editingSection.id, {
      section_type: updatedSection.section_type,
      section_key: updatedSection.section_key,
      is_visible: updatedSection.is_visible,
      section_config: updatedSection.section_config
    });
    setEditingSection(null);
    setShowSpecialEditor(false);
  };

  const getSectionName = (section: any) => {
    if (section.section_config?.name) return section.section_config.name;
    if (section.section_config?.title) return section.section_config.title;
    
    const typeNames: { [key: string]: string } = {
      product_section: 'Seção de Produtos',
      hero_banner: 'Banner Hero',
      promo_banner: 'Banner Promocional',
      custom_banner: 'Banner Customizado',
      special_section: 'Seção Especial',
      spacer: 'Espaçador'
    };
    
    return typeNames[section.section_type] || section.section_type;
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'product_section':
        return '🛍️';
      case 'hero_banner':
        return '🎯';
      case 'promo_banner':
      case 'custom_banner':
        return '📢';
      case 'special_section':
        return '✨';
      case 'spacer':
        return '⚪';
      default:
        return '📄';
    }
  };

  const getSectionDescription = (section: any) => {
    const config = section.section_config;
    
    switch (section.section_type) {
      case 'product_section':
        if (config?.mode === 'automatic') {
          return `Automático • ${config?.criteria?.limit || 12} produtos • ${config?.criteria?.sortBy || 'newest'}`;
        } else {
          return `Manual • ${config?.selectedProducts?.length || 0} produtos selecionados`;
        }
      case 'custom_banner':
        return config?.title || config?.description || 'Banner customizado';
      case 'promo_banner':
        return config?.bannerData?.title || 'Banner promocional';
      case 'spacer':
        return `Espaçamento: ${config?.height || '50'}px`;
      default:
        return config?.description || 'Seção configurada';
    }
  };

  if (sections.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Página em Branco</h3>
          <p className="text-muted-foreground mb-4">
            Comece adicionando seções à sua página Prime usando as ferramentas da barra lateral.
          </p>
          <p className="text-sm text-muted-foreground">
            💡 Dica: Use seções de produtos para exibir catálogos dinâmicos e banners para promoções.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Layout da Página</h3>
          <Badge variant="outline">
            {sections.length} seções
          </Badge>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg' : ''
                        } ${!section.is_visible ? 'opacity-60' : ''}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-5 h-5 text-muted-foreground" />
                            </div>

                            {/* Section Icon & Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getSectionIcon(section.section_type)}</span>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium truncate">
                                    {getSectionName(section)}
                                  </h4>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {getSectionDescription(section)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center space-x-2">
                              <Badge variant={section.is_visible ? 'default' : 'secondary'} className="text-xs">
                                {section.is_visible ? 'Visível' : 'Oculta'}
                              </Badge>
                              
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleVisibility(section)}
                                  title={section.is_visible ? 'Ocultar seção' : 'Mostrar seção'}
                                >
                                  {section.is_visible ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSection(section)}
                                  title="Editar seção"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSection(section)}
                                  title="Excluir seção"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Product Section Editor */}
      <ProductSectionEditor
        open={showProductEditor}
        onClose={() => {
          setShowProductEditor(false);
          setEditingSection(null);
        }}
        section={editingSection}
        onSectionUpdated={handleProductSectionUpdate}
      />

      {/* Special Section Editor */}
      <SpecialSectionEditor
        open={showSpecialEditor}
        onClose={() => {
          setShowSpecialEditor(false);
          setEditingSection(null);
        }}
        section={editingSection}
        onSectionUpdated={handleSpecialSectionUpdate}
      />

      {/* Generic Edit Section Modal (for simple sections) */}
      {editingSection && !showProductEditor && !showSpecialEditor && editForm.section_key !== undefined && (
        <Dialog open={true} onOpenChange={() => setEditingSection(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Seção: {getSectionName(editingSection)}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="section_key">Chave da Seção</Label>
                <Input
                  id="section_key"
                  value={editForm.section_key || ''}
                  onChange={(e) => setEditForm({ ...editForm, section_key: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editForm.is_visible || false}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_visible: checked })}
                />
                <Label>Seção visível</Label>
              </div>

              {/* Section-specific config fields */}
              {editingSection.section_type === 'custom_banner' && (
                <>
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={editForm.section_config?.title || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        section_config: { ...editForm.section_config, title: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={editForm.section_config?.description || ''}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        section_config: { ...editForm.section_config, description: e.target.value }
                      })}
                    />
                  </div>
                </>
              )}

              {editingSection.section_type === 'spacer' && (
                <div>
                  <Label>Altura (px)</Label>
                  <Input
                    type="number"
                    value={editForm.section_config?.height || ''}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      section_config: { ...editForm.section_config, height: e.target.value }
                    })}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingSection(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default VisualBuilder;