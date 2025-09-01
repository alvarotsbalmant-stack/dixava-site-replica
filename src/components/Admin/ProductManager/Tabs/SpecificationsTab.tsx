import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, X, Star, Settings, Gamepad2, Save, Trash2, Edit2, Loader2 } from 'lucide-react';
import { ProductFormData } from '@/types/product-extended';
import { useProductSpecifications } from '@/hooks/useProductSpecifications';

interface SpecificationsTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const SpecificationsTab: React.FC<SpecificationsTabProps> = ({ formData, onChange }) => {
  const { toast } = useToast();
  const productId = formData.id;
  
  // Use hook only if productId exists, otherwise manage locally
  const { 
    categorizedSpecs: dbSpecs, 
    loading, 
    addSpecification, 
    updateSpecification, 
    deleteSpecification,
    refreshSpecifications 
  } = useProductSpecifications(productId || '');
  
  // Local state for unsaved products
  const [localSpecs, setLocalSpecs] = useState<Array<{
    id: string;
    category: string;
    label: string;
    value: string;
    highlight: boolean;
    order_index: number;
    icon?: string;
  }>>([]);
  
  const [newSpec, setNewSpec] = useState({
    category: '',
    label: '',
    value: '',
    highlight: false,
    order_index: 0,
    icon: ''
  });
  const [editingSpec, setEditingSpec] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Helper function to group specs by category
  const groupSpecificationsByCategory = (specs: typeof localSpecs) => {
    const categoryMap = new Map<string, typeof localSpecs>();
    
    specs.forEach(spec => {
      if (!categoryMap.has(spec.category)) {
        categoryMap.set(spec.category, []);
      }
      categoryMap.get(spec.category)!.push(spec);
    });

    return Array.from(categoryMap.entries()).map(([category, items]) => ({
      category,
      items: items.sort((a, b) => a.order_index - b.order_index)
    }));
  };

  // Get specs from database if product exists, otherwise use local state
  const hasProductId = Boolean(productId);
  const categorizedSpecs = hasProductId ? dbSpecs : groupSpecificationsByCategory(localSpecs);

  // Sync local specs changes to parent form
  React.useEffect(() => {
    if (!hasProductId) {
      // Update the form data with local specs for unsaved products
      const specsForSaving = localSpecs.map(spec => ({
        product_id: '', // Will be filled when product is saved
        category: spec.category,
        label: spec.label,
        value: spec.value,
        highlight: spec.highlight,
        order_index: spec.order_index
      }));
      onChange('localSpecifications', specsForSaving);
    }
  }, [localSpecs, hasProductId, onChange]);

  // Templates de especificações por categoria
  const predefinedCategories = [
    { value: 'general', label: 'Informações Gerais', defaultIcon: '📋' },
    { value: 'technical', label: 'Especificações Técnicas', defaultIcon: '⚙️' },
    { value: 'storage', label: 'Armazenamento e Instalação', defaultIcon: '💾' },
    { value: 'multiplayer', label: 'Recursos Online', defaultIcon: '🌐' },
    { value: 'physical', label: 'Informações Físicas', defaultIcon: '📏' },
    { value: 'compatibility', label: 'Compatibilidade', defaultIcon: '🔗' },
    { value: 'performance', label: 'Performance', defaultIcon: '⚡' },
    { value: 'audio', label: 'Áudio e Vídeo', defaultIcon: '🎵' }
  ];

  const specTemplates = {
    console: [
      { category: 'general', label: 'Plataforma', value: '', highlight: true, icon: '📋' },
      { category: 'general', label: 'Modelo', value: '', highlight: true, icon: '📋' },
      { category: 'general', label: 'Cor', value: '', highlight: false, icon: '📋' },
      { category: 'general', label: 'Condição', value: 'Novo', highlight: false, icon: '📋' },
      { category: 'technical', label: 'Processador', value: '', highlight: false, icon: '⚙️' },
      { category: 'technical', label: 'Memória RAM', value: '', highlight: false, icon: '⚙️' },
      { category: 'storage', label: 'Armazenamento', value: '', highlight: true, icon: '💾' },
      { category: 'technical', label: 'Resolução Máxima', value: '4K', highlight: false, icon: '⚙️' }
    ],
    game: [
      { category: 'general', label: 'Plataforma', value: '', highlight: true, icon: '📋' },
      { category: 'general', label: 'Gênero', value: '', highlight: true, icon: '📋' },
      { category: 'general', label: 'Classificação', value: '', highlight: false, icon: '📋' },
      { category: 'general', label: 'Desenvolvedor', value: '', highlight: false, icon: '📋' },
      { category: 'general', label: 'Data de Lançamento', value: '', highlight: false, icon: '📋' },
      { category: 'storage', label: 'Idiomas', value: '', highlight: false, icon: '💾' },
      { category: 'multiplayer', label: 'Modos de Jogo', value: '', highlight: false, icon: '🌐' },
      { category: 'storage', label: 'Espaço Necessário', value: '', highlight: true, icon: '💾' },
      { category: 'multiplayer', label: 'Jogadores Online', value: '', highlight: false, icon: '🌐' }
    ],
    accessory: [
      { category: 'general', label: 'Tipo', value: '', highlight: true, icon: '📋' },
      { category: 'compatibility', label: 'Compatibilidade', value: '', highlight: true, icon: '🔗' },
      { category: 'general', label: 'Cor', value: '', highlight: false, icon: '📋' },
      { category: 'physical', label: 'Material', value: '', highlight: false, icon: '📏' },
      { category: 'technical', label: 'Conectividade', value: '', highlight: false, icon: '⚙️' },
      { category: 'physical', label: 'Dimensões', value: '', highlight: false, icon: '📏' },
      { category: 'physical', label: 'Peso', value: '', highlight: false, icon: '📏' },
      { category: 'general', label: 'Garantia', value: '1 ano', highlight: false, icon: '📋' }
    ]
  };

  const handleApplyTemplate = async (templateKey: keyof typeof specTemplates) => {
    setSaving(true);
    try {
      const template = specTemplates[templateKey];
      
      if (hasProductId) {
        // Product exists, save to database
        for (let i = 0; i < template.length; i++) {
          const spec = template[i];
        await addSpecification({
          product_id: productId!,
          category: spec.category,
          label: spec.label,
          value: spec.value,
          highlight: spec.highlight,
          order_index: i + 1,
          icon: spec.icon || ''
        });
        }
        await refreshSpecifications();
      } else {
        // Product doesn't exist, save to local state
        const templateSpecs = template.map((spec, i) => ({
          id: `temp-${Date.now()}-${i}`,
          category: spec.category,
          label: spec.label,
          value: spec.value,
          highlight: spec.highlight,
          order_index: i + 1,
          icon: spec.icon || ''
        }));
        setLocalSpecs(prev => [...prev, ...templateSpecs]);
      }
      
      toast({
        title: "Template aplicado!",
        description: `${template.length} especificações foram adicionadas.`,
      });
    } catch (error) {
      console.error('Erro ao aplicar template:', error);
      toast({
        title: "Erro ao aplicar template",
        description: "Não foi possível aplicar o template. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpec = async () => {
    if (!newSpec.category || !newSpec.label || !newSpec.value) return;
    
    setSaving(true);
    try {
      const categorySpecs = categorizedSpecs.find(cat => cat.category === newSpec.category);
      const nextOrderIndex = categorySpecs ? categorySpecs.items.length + 1 : 1;
      
      if (hasProductId) {
        // Product exists, save to database
        await addSpecification({
          product_id: productId!,
          category: newSpec.category,
          label: newSpec.label,
          value: newSpec.value,
          highlight: newSpec.highlight,
          order_index: nextOrderIndex,
          icon: newSpec.icon
        });
      } else {
        // Product doesn't exist, save to local state
        const newSpecWithId = {
          id: `temp-${Date.now()}`,
          category: newSpec.category,
          label: newSpec.label,
          value: newSpec.value,
          highlight: newSpec.highlight,
          order_index: nextOrderIndex,
          icon: newSpec.icon
        };
        setLocalSpecs(prev => [...prev, newSpecWithId]);
      }
      
      setNewSpec({ 
        category: '',
        label: '', 
        value: '', 
        highlight: false,
        order_index: 0,
        icon: ''
      });
      
      toast({
        title: "Especificação adicionada!",
        description: "A especificação foi adicionada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao adicionar especificação:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a especificação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSpec = async (specId: string, field: string, value: any) => {
    setSaving(true);
    try {
      if (hasProductId) {
        // Product exists, update in database
        await updateSpecification(specId, { [field]: value });
      } else {
        // Product doesn't exist, update in local state
        setLocalSpecs(prev => prev.map(spec => 
          spec.id === specId ? { ...spec, [field]: value } : spec
        ));
      }
      
      toast({
        title: "Especificação atualizada!",
        description: "A alteração foi salva com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar especificação:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar a alteração. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpec = async (specId: string) => {
    setSaving(true);
    try {
      if (hasProductId) {
        // Product exists, delete from database
        await deleteSpecification(specId);
      } else {
        // Product doesn't exist, delete from local state
        setLocalSpecs(prev => prev.filter(spec => spec.id !== specId));
      }
      
      toast({
        title: "Especificação removida!",
        description: "A especificação foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover especificação:', error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a especificação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Carregando especificações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Templates Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(specTemplates).map(([key, template]) => (
              <Button
                key={key}
                variant="outline"
                onClick={() => handleApplyTemplate(key as keyof typeof specTemplates)}
                disabled={saving}
                className="h-auto p-4 flex flex-col items-start"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-medium capitalize">{key}</span>
                </div>
                <span className="text-xs text-gray-500 text-left">
                  {template.length} especificações
                </span>
              </Button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Os templates adicionarão especificações básicas para o tipo de produto.
          </p>
        </CardContent>
      </Card>

      {/* Adicionar Nova Especificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Especificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Categoria</Label>
              <Select
                value={newSpec.category}
                onValueChange={(value) => {
                  const categoryData = predefinedCategories.find(cat => cat.value === value);
                  setNewSpec(prev => ({ 
                    ...prev, 
                    category: value,
                    icon: prev.icon || categoryData?.defaultIcon || ''
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {predefinedCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.defaultIcon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Ícone</Label>
              <Input
                value={newSpec.icon}
                onChange={(e) => setNewSpec(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Ex: 🎮"
                className="text-center"
              />
            </div>
            
            <div>
              <Label>Nome da Especificação</Label>
              <Input
                value={newSpec.label}
                onChange={(e) => setNewSpec(prev => ({ ...prev, label: e.target.value }))}
                placeholder="Ex: Processador"
              />
            </div>
            
            <div>
              <Label>Valor</Label>
              <Input
                value={newSpec.value}
                onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Ex: AMD Ryzen Zen 2"
              />
            </div>
            
            <div className="flex items-end">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  checked={newSpec.highlight}
                  onCheckedChange={(checked) => setNewSpec(prev => ({ ...prev, highlight: checked as boolean }))}
                />
                <Label className="text-xs">Destacar</Label>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={handleAddSpec}
              disabled={!newSpec.category || !newSpec.label || !newSpec.value || saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Adicionar Especificação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Especificações por Categoria */}
      {categorizedSpecs.map((category) => (
        <Card key={category.category}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {category.items[0]?.icon ? (
                  <span className="text-xl">{category.items[0].icon}</span>
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                {category.category}
              </CardTitle>
              <Badge variant="outline">
                {category.items.length} {category.items.length === 1 ? 'item' : 'itens'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {category.items.map((spec) => (
              <div key={spec.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Input
                      value={spec.icon || ''}
                      onChange={(e) => handleUpdateSpec(spec.id, 'icon', e.target.value)}
                      placeholder="Ícone"
                      disabled={saving}
                      className="text-center w-16"
                    />
                  </div>
                  <div>
                    <Input
                      value={spec.label}
                      onChange={(e) => handleUpdateSpec(spec.id, 'label', e.target.value)}
                      placeholder="Nome da especificação"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <Input
                      value={spec.value}
                      onChange={(e) => handleUpdateSpec(spec.id, 'value', e.target.value)}
                      placeholder="Valor"
                      disabled={saving}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={spec.highlight}
                    onCheckedChange={(checked) => handleUpdateSpec(spec.id, 'highlight', checked)}
                    disabled={saving}
                  />
                  <Label className="text-xs">Destaque</Label>
                </div>

                {spec.highlight && (
                  <Star className="w-4 h-4 text-yellow-500" />
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteSpec(spec.id)}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
            
            {category.items.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                Nenhuma especificação nesta categoria ainda.
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Estado Vazio */}
      {categorizedSpecs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma especificação configurada</h3>
            <p className="text-gray-500 mb-4">
              Use um template acima ou adicione especificações manualmente para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpecificationsTab;