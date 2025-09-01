
// @ts-nocheck
import React, { useState, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { GripVertical, Eye, EyeOff, Save, X, RotateCcw, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHomepageLayout, HomepageLayoutItem } from '@/hooks/useHomepageLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';
import PromotionalRibbonManager from '@/components/Admin/PromotionalRibbonManager';

// Sortable Item Component
interface SortableItemProps {
  item: HomepageLayoutItem;
  onVisibilityToggle: (id: number, isVisible: boolean) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, onVisibilityToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className={`bg-[#2C2C44] hover:bg-[#343A40] border-b border-[#343A40] transition-colors ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <TableCell className="w-12 cursor-grab touch-none">
        <div 
          {...listeners} 
          className="flex items-center justify-center p-2 rounded hover:bg-[#343A40] transition-colors"
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </TableCell>
      <TableCell className="font-medium text-white">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-semibold">{item.title || item.section_key}</div>
            {item.title && item.section_key !== item.title && (
              <div className="text-sm text-gray-400">{item.section_key}</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right w-32">
        <div className="flex items-center justify-end gap-2">
          <Badge 
            variant={item.is_visible ? "default" : "secondary"}
            className={`${
              item.is_visible 
                ? 'bg-[#28A745] text-white' 
                : 'bg-[#6C757D] text-white'
            }`}
          >
            {item.is_visible ? (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Visível
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Oculto
              </>
            )}
          </Badge>
          <Switch
            id={`visibility-${item.id}`}
            checked={item.is_visible}
            onCheckedChange={(checked) => onVisibilityToggle(item.id, checked)}
            aria-label={item.is_visible ? 'Ocultar seção' : 'Mostrar seção'}
            className="data-[state=checked]:bg-[#007BFF]"
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

// Main AdminSections Component
const AdminSections: React.FC = () => {
  const { toast } = useToast();
  const { layoutItems, setLayoutItems, loading, error, updateLayout, fetchLayout } = useHomepageLayout();
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLayoutItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, display_order: index + 1 }));
      });
      setHasChanges(true);
    }
  }, [setLayoutItems]);

  const handleVisibilityToggle = useCallback((id: number, isVisible: boolean) => {
    setLayoutItems((items) =>
      items.map((item) => (item.id === id ? { ...item, is_visible: isVisible } : item))
    );
    setHasChanges(true);
  }, [setLayoutItems]);

  const handleSaveChanges = async () => {
    const updates = layoutItems.map(item => ({
      id: item.id,
      section_key: item.section_key,
      display_order: item.display_order,
      is_visible: item.is_visible,
    }));
    await updateLayout(updates);
    setHasChanges(false);
  };

  const handleCancelChanges = () => {
    fetchLayout();
    setHasChanges(false);
  };

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    // Simula o upload da imagem, retornando uma URL temporária
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-[#2C2C44] border-[#343A40]">
        <CardHeader className="border-b border-[#343A40]">
          <CardTitle className="text-white text-xl">Organização da Página Inicial</CardTitle>
          <p className="text-gray-400 text-sm">
            Arraste e solte as seções para reordenar como elas aparecem na página inicial. Use o switch para ativar ou desativar a visibilidade.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading && (
            <div className="p-6 space-y-3">
              <Skeleton className="h-16 w-full bg-[#343A40]" />
              <Skeleton className="h-16 w-full bg-[#343A40]" />
              <Skeleton className="h-16 w-full bg-[#343A40]" />
            </div>
          )}
          {error && (
            <div className="p-6">
              <div className="bg-[#DC3545] bg-opacity-10 border border-[#DC3545] rounded-lg p-4">
                <p className="text-[#DC3545] font-medium">Erro ao carregar layout</p>
                <p className="text-gray-400 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          {!loading && !error && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={layoutItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[#343A40] hover:bg-transparent">
                      <TableHead className="w-12 text-gray-400"></TableHead>
                      <TableHead className="text-gray-400 font-semibold">Seção</TableHead>
                      <TableHead className="text-right w-32 text-gray-400 font-semibold">Visibilidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {layoutItems.length > 0 ? (
                      layoutItems.map((item) => (
                        <SortableItem key={item.id} item={item} onVisibilityToggle={handleVisibilityToggle} />
                      ))
                    ) : (
                      <TableRow className="border-b border-[#343A40]">
                        <TableCell colSpan={3} className="text-center text-gray-400 py-12">
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-lg font-medium">Nenhuma seção encontrada</div>
                            <div className="text-sm">
                              Verifique se executou os scripts SQL e inseriu os dados iniciais na tabela `homepage_layout`.
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
        {!loading && !error && layoutItems.length > 0 && (
          <CardFooter className="border-t border-[#343A40] bg-[#2C2C44] flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {hasChanges ? (
                <span className="text-[#FFC107]">• Alterações não salvas</span>
              ) : (
                <span>Todas as alterações foram salvas</span>
              )}
            </div>
            <div className="flex gap-2">
              {hasChanges && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelChanges} 
                  disabled={loading}
                  className="border-[#6C757D] text-[#6C757D] hover:bg-[#6C757D] hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
              <Button 
                onClick={handleSaveChanges} 
                disabled={!hasChanges || loading}
                className={`${
                  hasChanges 
                    ? 'bg-[#007BFF] hover:bg-[#0056B3] text-white' 
                    : 'bg-[#28A745] text-white cursor-default'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : hasChanges ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvo
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Seção da Fita Promocional */}
      <div className="mt-6">
        <PromotionalRibbonManager />
      </div>
    </div>
  );
};

export default AdminSections;
