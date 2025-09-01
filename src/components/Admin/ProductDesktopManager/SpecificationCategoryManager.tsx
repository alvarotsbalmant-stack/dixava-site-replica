import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useProductSpecifications, ProductSpecification, SpecificationCategory } from '@/hooks/useProductSpecifications';
import { Plus, Trash2, Edit, Save, X, Settings, Wrench, HardDrive, Globe, Package as PackageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getAllSpecificationCodes, 
  getSpecificationByCode, 
  formatCategoryWithCode 
} from '@/utils/specificationCodes';

interface SpecificationCategoryManagerProps {
  productId: string;
  categorizedSpecs: SpecificationCategory[];
  onSpecificationsChange: () => void;
}

const SpecificationCategoryManager: React.FC<SpecificationCategoryManagerProps> = ({
  productId,
  categorizedSpecs,
  onSpecificationsChange
}) => {
  const { addSpecification, updateSpecification, deleteSpecification } = useProductSpecifications(productId);
  const [newSpec, setNewSpec] = useState({
    category: '',
    label: '',
    value: '',
    highlight: false,
    order_index: 0
  });
  const [editingSpec, setEditingSpec] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ProductSpecification>>({});

  const predefinedCategories = getAllSpecificationCodes().map(spec => ({
    value: spec.code,
    label: spec.categoryName,
    icon: spec.emoji,
    code: spec.code
  }));

  const specTemplates: Record<string, Array<{label: string, value: string, highlight?: boolean}>> = {
    TECH: [
      { label: 'Processador', value: 'AMD Ryzen 7', highlight: true },
      { label: 'Memória RAM', value: '16GB DDR4', highlight: true },
      { label: 'Arquitetura', value: '64-bit' }
    ],
    PERF: [
      { label: 'Resolução Máxima', value: '4K Ultra HD', highlight: true },
      { label: 'Taxa de Quadros', value: '60 FPS', highlight: true },
      { label: 'Ray Tracing', value: 'Suportado' }
    ],
    STORAGE: [
      { label: 'Armazenamento Principal', value: '1TB SSD', highlight: true },
      { label: 'Tipo de Storage', value: 'NVMe PCIe 4.0' },
      { label: 'Capacidade Expansível', value: 'Sim' }
    ],
    CONNECT: [
      { label: 'Wi-Fi', value: '802.11ac' },
      { label: 'Bluetooth', value: '5.0' },
      { label: 'Portas USB', value: '4x USB 3.0' },
      { label: 'HDMI', value: '2.1' }
    ],
    DISPLAY: [
      { label: 'Resolução', value: '3840x2160', highlight: true },
      { label: 'Taxa de Atualização', value: '120Hz' },
      { label: 'HDR', value: 'HDR10 / Dolby Vision' }
    ],
    AUDIO: [
      { label: 'Sistema de Áudio', value: 'Dolby Atmos', highlight: true },
      { label: 'Canais', value: '7.1 Surround' },
      { label: 'Áudio 3D', value: 'Suportado' }
    ]
  };

  const handleAddSpecification = async () => {
    if (!newSpec.category || !newSpec.label || !newSpec.value) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const result = await addSpecification({
        product_id: productId,
        category: newSpec.category,
        label: newSpec.label,
        value: newSpec.value,
        highlight: newSpec.highlight,
        order_index: newSpec.order_index
      });

      if (result.success) {
        toast.success('Especificação adicionada com sucesso!');
        setNewSpec({
          category: '',
          label: '',
          value: '',
          highlight: false,
          order_index: 0
        });
        onSpecificationsChange();
      } else {
        toast.error('Erro ao adicionar especificação');
      }
    } catch (error) {
      console.error('Erro ao adicionar especificação:', error);
      toast.error('Erro ao adicionar especificação');
    }
  };

  const handleUpdateSpecification = async (id: string) => {
    try {
      const result = await updateSpecification(id, editData);
      if (result.success) {
        toast.success('Especificação atualizada com sucesso!');
        setEditingSpec(null);
        setEditData({});
        onSpecificationsChange();
      } else {
        toast.error('Erro ao atualizar especificação');
      }
    } catch (error) {
      console.error('Erro ao atualizar especificação:', error);
      toast.error('Erro ao atualizar especificação');
    }
  };

  const handleDeleteSpecification = async (id: string) => {
    try {
      const result = await deleteSpecification(id);
      if (result.success) {
        toast.success('Especificação removida com sucesso!');
        onSpecificationsChange();
      } else {
        toast.error('Erro ao remover especificação');
      }
    } catch (error) {
      console.error('Erro ao remover especificação:', error);
      toast.error('Erro ao remover especificação');
    }
  };

  const handleApplyTemplate = async (templateCategory: string) => {
    const template = specTemplates[templateCategory];
    if (!template) return;
    
    const specMapping = getSpecificationByCode(templateCategory);
    if (!specMapping) return;
    
    try {
      for (const spec of template) {
        await addSpecification({
          product_id: productId,
          category: specMapping.categoryName,
          label: spec.label,
          value: spec.value,
          highlight: spec.highlight || false,
          icon: specMapping.emoji,
          order_index: 0
        });
      }
      
      onSpecificationsChange();
      toast.success(`Template "${specMapping.categoryName}" aplicado com sucesso!`);
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      toast.error('Erro ao aplicar template');
    }
  };

  const extractEmojiFromText = (text: string): { emoji: string | null; cleanText: string } => {
    // Regex para detectar emojis no início do texto
    const emojiRegex = /^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}])\s*/u;
    const match = text.match(emojiRegex);
    
    if (match) {
      return {
        emoji: match[1],
        cleanText: text.replace(emojiRegex, '').trim()
      };
    }
    
    return {
      emoji: null,
      cleanText: text
    };
  };

  const getCategoryIcon = (category: string) => {
    // Primeiro, tentar extrair emoji da própria categoria
    const { emoji } = extractEmojiFromText(category);
    if (emoji) {
      return emoji;
    }
    
    // Tentar encontrar por código de especificação
    const categoryConfig = predefinedCategories.find(c => 
      c.value === category || c.label === category
    );
    return categoryConfig?.icon || '📄';
  };

  const getCategoryLabel = (category: string) => {
    // Extrair texto limpo sem emoji
    const { cleanText } = extractEmojiFromText(category);
    
    // Se não conseguiu extrair texto limpo, tentar mapear por categorias predefinidas
    if (cleanText === category) {
      const categoryConfig = predefinedCategories.find(c => 
        c.value === category || c.label === category
      );
      return categoryConfig?.label || category;
    }
    
    return cleanText;
  };

  return (
    <div className="space-y-6 max-h-none overflow-visible">
      {/* Quick Templates */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Templates Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.keys(specTemplates).map((templateKey) => {
              const specMapping = getSpecificationByCode(templateKey);
              if (!specMapping) return null;
              
              return (
                <Button
                  key={templateKey}
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyTemplate(templateKey)}
                  className="flex items-center gap-2 h-auto py-2 px-3"
                >
                  <span>{specMapping.emoji}</span>
                  <span className="text-xs">{specMapping.categoryName}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add New Specification */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Especificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={newSpec.category} onValueChange={(value) => setNewSpec(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedCategories.map((category) => (
                    <SelectItem key={category.code} value={category.label}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">[{category.code}]</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rótulo</Label>
              <Input
                value={newSpec.label}
                onChange={(e) => setNewSpec(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Marca/Editora, Resolução, etc."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                value={newSpec.value}
                onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Ex: Ubisoft, 4K, Sim/Não, etc."
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={newSpec.highlight}
                  onCheckedChange={(checked) => setNewSpec(prev => ({ ...prev, highlight: !!checked }))}
                />
                Destacar especificação
              </Label>
            </div>
          </div>
          <Button onClick={handleAddSpecification} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Especificação
          </Button>
        </CardContent>
      </Card>

      {/* Existing Specifications */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-base">Especificações Existentes</CardTitle>
        </CardHeader>
        <CardContent className="max-h-none overflow-visible">
          {categorizedSpecs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PackageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma especificação cadastrada ainda.</p>
              <p className="text-sm">Use os templates rápidos ou adicione manualmente.</p>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full">
              {categorizedSpecs.map((category) => (
                <AccordionItem key={category.category} value={category.category}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCategoryIcon(category.category)}</span>
                      <span className="font-medium">{getCategoryLabel(category.category)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.items.length} itens
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-4">
                      {category.items.map((spec) => (
                        <div key={spec.id} className="flex items-center justify-between p-3 border rounded-lg">
                          {editingSpec === spec.id ? (
                            <div className="flex-1 grid grid-cols-3 gap-2 mr-4">
                              <Input
                                value={editData.label || spec.label}
                                onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
                                placeholder="Rótulo"
                              />
                              <Input
                                value={editData.value || spec.value}
                                onChange={(e) => setEditData(prev => ({ ...prev, value: e.target.value }))}
                                placeholder="Valor"
                              />
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={editData.highlight !== undefined ? editData.highlight : spec.highlight}
                                  onCheckedChange={(checked) => setEditData(prev => ({ ...prev, highlight: !!checked }))}
                                />
                                <span className="text-sm text-muted-foreground">Destacar</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{spec.label}:</span>
                                <span>{spec.value}</span>
                                {spec.highlight && (
                                  <Badge variant="secondary" className="text-xs">
                                    DESTAQUE
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2">
                            {editingSpec === spec.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateSpecification(spec.id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingSpec(null);
                                    setEditData({});
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingSpec(spec.id);
                                    setEditData({
                                      label: spec.label,
                                      value: spec.value,
                                      highlight: spec.highlight
                                    });
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteSpecification(spec.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecificationCategoryManager;
