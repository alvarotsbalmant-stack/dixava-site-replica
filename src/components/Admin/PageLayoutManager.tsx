import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Eye, EyeOff, Plus, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePages, Page, PageLayoutItem } from '@/hooks/usePages';

// Tipos de seção disponíveis
const SECTION_TYPES = [
  { id: 'banner', label: 'Banner' },
  { id: 'products', label: 'Produtos' },
  { id: 'featured', label: 'Destaques' },
  { id: 'custom', label: 'Conteúdo Personalizado' }
] as const;

// Componente para item ordenável
interface SortableItemProps {
  item: PageLayoutItem;
  onVisibilityToggle: (id: string, isVisible: boolean) => void;
  onEditSection: (item: PageLayoutItem) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, onVisibilityToggle, onEditSection }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  // Use both is_visible and isVisible for compatibility
  const isVisible = item.is_visible ?? item.isVisible ?? true;
  const sectionType = (item.section_type || item.sectionType || 'products') as 'banner' | 'products' | 'featured' | 'custom';
  const sectionKey = item.section_key || item.sectionKey || '';

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} className="bg-background hover:bg-muted/50">
      <TableCell className="w-10 cursor-grab touch-none">
        <GripVertical {...listeners} className="h-5 w-5 text-muted-foreground" />
      </TableCell>
      <TableCell className="font-medium">{item.title || sectionKey}</TableCell>
      <TableCell>{SECTION_TYPES.find(t => t.id === sectionType)?.label || sectionType}</TableCell>
      <TableCell className="text-right w-24 flex items-center justify-end gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEditSection(item)}
          className="mr-2"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configurar</span>
        </Button>
        <Switch
          id={`visibility-${item.id}`}
          checked={isVisible}
          onCheckedChange={(checked) => onVisibilityToggle(item.id, checked)}
          aria-label={isVisible ? 'Ocultar seção' : 'Mostrar seção'}
        />
        {isVisible ? 
          <Eye className="h-4 w-4 text-green-500 ml-1" /> : 
          <EyeOff className="h-4 w-4 text-red-500 ml-1" />
        }
      </TableCell>
    </TableRow>
  );
};

// Formulário para adicionar/editar seção
interface SectionFormProps {
  pageId: string;
  section?: PageLayoutItem;
  onSave: (section: Partial<PageLayoutItem>) => void;
  onCancel: () => void;
}

const SectionForm: React.FC<SectionFormProps> = ({ pageId, section, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PageLayoutItem>>({
    page_id: pageId,
    pageId: pageId,
    section_key: '',
    sectionKey: '',
    title: '',
    display_order: 999,
    displayOrder: 999,
    is_visible: true,
    isVisible: true,
    section_type: 'products',
    sectionType: 'products',
    sectionConfig: {}
  });

  useEffect(() => {
    if (section) {
      setFormData({
        ...section,
        // Ensure both naming conventions are set
        page_id: section.page_id || section.pageId || pageId,
        pageId: section.page_id || section.pageId || pageId,
        section_key: section.section_key || section.sectionKey || '',
        sectionKey: section.section_key || section.sectionKey || '',
        display_order: section.display_order ?? section.displayOrder ?? 999,
        displayOrder: section.display_order ?? section.displayOrder ?? 999,
        is_visible: section.is_visible ?? section.isVisible ?? true,
        isVisible: section.is_visible ?? section.isVisible ?? true,
        section_type: (section.section_type || section.sectionType || 'products') as 'banner' | 'products' | 'featured' | 'custom',
        sectionType: (section.section_type || section.sectionType || 'products') as 'banner' | 'products' | 'featured' | 'custom',
      });
    }
  }, [section, pageId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Keep both naming conventions in sync
      if (name === 'section_key') {
        updated.sectionKey = value;
      } else if (name === 'sectionKey') {
        updated.section_key = value;
      }
      
      return updated;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value as 'banner' | 'products' | 'featured' | 'custom' };
      
      // Keep both naming conventions in sync
      if (name === 'section_type') {
        updated.sectionType = value as 'banner' | 'products' | 'featured' | 'custom';
      } else if (name === 'sectionType') {
        updated.section_type = value as 'banner' | 'products' | 'featured' | 'custom';
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate section_key if not provided
    const sectionKey = formData.section_key || formData.sectionKey || `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const finalData = {
      ...formData,
      section_key: sectionKey,
      sectionKey: sectionKey,
      page_id: pageId,
      pageId: pageId,
    };
    
    console.log("Submitting section form with data:", finalData);
    onSave(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Seção</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            placeholder="Ex: Produtos em Destaque"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="section_key">Chave da Seção</Label>
          <Input
            id="section_key"
            name="section_key"
            value={formData.section_key || formData.sectionKey || ''}
            onChange={handleInputChange}
            placeholder="Ex: featured_products (deixe vazio para gerar automaticamente)"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="section_type">Tipo de Seção</Label>
        <Select
          value={formData.section_type || formData.sectionType || 'products'}
          onValueChange={(value) => handleSelectChange('section_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de seção" />
          </SelectTrigger>
          <SelectContent>
            {SECTION_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_visible"
          checked={formData.is_visible ?? formData.isVisible ?? true}
          onCheckedChange={(checked) => setFormData(prev => ({ 
            ...prev, 
            is_visible: checked, 
            isVisible: checked 
          }))}
        />
        <Label htmlFor="is_visible">Seção Visível</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {section ? 'Atualizar Seção' : 'Adicionar Seção'}
        </Button>
      </div>
    </form>
  );
};

// Componente principal
interface PageLayoutManagerProps {
  page: Page;
}

const PageLayoutManager: React.FC<PageLayoutManagerProps> = ({ page }) => {
  const { toast } = useToast();
  const { 
    pageLayouts, 
    fetchPageLayout, 
    updatePageLayout, 
    addPageSection, 
    removePageSection,
    loading, 
    error 
  } = usePages();
  
  const [layoutItems, setLayoutItems] = useState<PageLayoutItem[]>([]);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageLayoutItem | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Carregar layout da página
  useEffect(() => {
    const loadPageLayout = async () => {
      try {
        console.log("Loading page layout for page:", page.id);
        const layout = await fetchPageLayout(page.id);
        console.log("Loaded layout:", layout);
        setLayoutItems(layout);
      } catch (err) {
        console.error('Erro ao carregar layout:', err);
        toast({
          title: "Erro ao carregar layout",
          description: "Não foi possível carregar o layout da página.",
          variant: "destructive"
        });
      }
    };
    
    loadPageLayout();
  }, [page.id, fetchPageLayout, toast]);

  // Atualizar layout local quando o layout da página mudar
  useEffect(() => {
    if (pageLayouts[page.id]) {
      console.log("Updating local layout items from pageLayouts:", pageLayouts[page.id]);
      setLayoutItems(pageLayouts[page.id]);
    }
  }, [pageLayouts, page.id]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLayoutItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update both naming conventions for display_order
        return newItems.map((item, index) => ({ 
          ...item, 
          display_order: index + 1,
          displayOrder: index + 1
        }));
      });
      setHasChanges(true);
    }
  }, []);

  const handleVisibilityToggle = useCallback((id: string, isVisible: boolean) => {
    setLayoutItems((items) =>
      items.map((item) => (item.id === id ? { 
        ...item, 
        is_visible: isVisible,
        isVisible: isVisible
      } : item))
    );
    setHasChanges(true);
  }, []);

  const handleSaveChanges = async () => {
    try {
      console.log("Saving changes for items:", layoutItems);
      
      await updatePageLayout(page.id, layoutItems);
      setHasChanges(false);
      
      toast({
        title: "Layout atualizado",
        description: "As alterações no layout da página foram salvas com sucesso."
      });
    } catch (err) {
      console.error("Error saving changes:", err);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as alterações no layout.",
        variant: "destructive"
      });
    }
  };

  const handleAddSection = async (sectionData: Partial<PageLayoutItem>) => {
    try {
      console.log("Adding new section:", sectionData);
      
      // Calculate the next display order
      const nextOrder = layoutItems.length > 0 
        ? Math.max(...layoutItems.map(item => item.display_order || item.displayOrder || 0)) + 1 
        : 1;
      
      const sectionToAdd = {
        ...sectionData,
        page_id: page.id,
        pageId: page.id,
        display_order: nextOrder,
        displayOrder: nextOrder,
        is_visible: sectionData.is_visible ?? sectionData.isVisible ?? true,
        isVisible: sectionData.is_visible ?? sectionData.isVisible ?? true,
        section_type: (sectionData.section_type || sectionData.sectionType || 'products') as 'banner' | 'products' | 'featured' | 'custom',
        sectionType: (sectionData.section_type || sectionData.sectionType || 'products') as 'banner' | 'products' | 'featured' | 'custom',
      };
      
      console.log("Section to add with calculated order:", sectionToAdd);
      
      const newSection = await addPageSection(page.id, sectionToAdd as Omit<PageLayoutItem, 'id'>);
      console.log("Successfully added section:", newSection);
      
      setIsAddingSectionOpen(false);
      
      toast({
        title: "Seção adicionada",
        description: `A seção "${sectionData.title || sectionData.section_key || sectionData.sectionKey}" foi adicionada com sucesso.`
      });
    } catch (err: any) {
      console.error("Error adding section:", err);
      toast({
        title: "Erro ao adicionar seção",
        description: `Ocorreu um erro ao adicionar a nova seção: ${err.message}`,
        variant: "destructive"
      });
    }
  };

  const handleUpdateSection = async (sectionData: Partial<PageLayoutItem>) => {
    if (!editingSection) return;
    
    try {
      console.log("Updating section:", editingSection.id, "with data:", sectionData);
      
      const updatedItems = layoutItems.map(item => 
        item.id === editingSection.id ? { ...item, ...sectionData } : item
      );
      
      setLayoutItems(updatedItems);
      await updatePageLayout(page.id, [{ ...editingSection, ...sectionData }]);
      
      setEditingSection(null);
      
      toast({
        title: "Seção atualizada",
        description: `A seção "${sectionData.title || sectionData.section_key || sectionData.sectionKey}" foi atualizada com sucesso.`
      });
    } catch (err) {
      console.error("Error updating section:", err);
      toast({
        title: "Erro ao atualizar seção",
        description: "Ocorreu um erro ao atualizar a seção.",
        variant: "destructive"
      });
    }
  };

  const handleEditSection = (section: PageLayoutItem) => {
    console.log("Editing section:", section);
    setEditingSection(section);
  };

  const handleCancelChanges = async () => {
    try {
      // Recarregar layout original
      const originalLayout = await fetchPageLayout(page.id);
      setLayoutItems(originalLayout);
      setHasChanges(false);
      
      toast({
        title: "Alterações canceladas",
        description: "O layout foi restaurado para o estado original."
      });
    } catch (err) {
      console.error("Error canceling changes:", err);
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao restaurar o layout original.",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => fetchPageLayout(page.id)} className="mt-4">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Layout da Página: {page.title}</CardTitle>
          <Button onClick={() => setIsAddingSectionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Seção
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {!loading && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={layoutItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Seção</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {layoutItems.length > 0 ? (
                    layoutItems.map((item) => (
                      <SortableItem 
                        key={item.id} 
                        item={item} 
                        onVisibilityToggle={handleVisibilityToggle}
                        onEditSection={handleEditSection}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma seção encontrada. Adicione seções para personalizar esta página.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {hasChanges && (
          <Button variant="outline" onClick={handleCancelChanges} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleSaveChanges} disabled={!hasChanges || loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardFooter>

      {/* Dialog para adicionar nova seção */}
      <Dialog open={isAddingSectionOpen} onOpenChange={setIsAddingSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Seção</DialogTitle>
          </DialogHeader>
          <SectionForm 
            pageId={page.id}
            onSave={handleAddSection}
            onCancel={() => setIsAddingSectionOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para editar seção existente */}
      <Dialog open={!!editingSection} onOpenChange={(open) => !open && setEditingSection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Seção</DialogTitle>
          </DialogHeader>
          {editingSection && (
            <SectionForm 
              pageId={page.id}
              section={editingSection}
              onSave={handleUpdateSection}
              onCancel={() => setEditingSection(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PageLayoutManager;
