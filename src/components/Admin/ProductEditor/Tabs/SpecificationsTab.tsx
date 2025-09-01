import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Star, FileText, Settings, Gamepad2 } from 'lucide-react';
import { ProductEditorData } from '../ProductEditor';

interface SpecificationsTabProps {
  formData: ProductEditorData;
  onChange: (field: string, value: any) => void;
}

const SpecificationsTab: React.FC<SpecificationsTabProps> = ({ formData, onChange }) => {
  const [newSpec, setNewSpec] = useState({
    category: '',
    label: '',
    value: '',
    highlight: false,
  });

  // Categorias predefinidas
  const predefinedCategories = [
    { value: 'geral', label: 'Informações Gerais' },
    { value: 'tecnicas', label: 'Especificações Técnicas' },
    { value: 'armazenamento', label: 'Armazenamento e Instalação' },
    { value: 'online', label: 'Recursos Online' },
    { value: 'fisicas', label: 'Informações Físicas' },
    { value: 'compatibilidade', label: 'Compatibilidade' },
    { value: 'performance', label: 'Performance' },
    { value: 'audio-video', label: 'Áudio e Vídeo' }
  ];

  // Templates de especificações
  const specTemplates = {
    console: [
      { category: 'geral', label: 'Plataforma', value: '', highlight: true },
      { category: 'geral', label: 'Modelo', value: '', highlight: true },
      { category: 'geral', label: 'Cor', value: '', highlight: false },
      { category: 'geral', label: 'Condição', value: 'Novo', highlight: false },
      { category: 'tecnicas', label: 'Processador', value: '', highlight: false },
      { category: 'tecnicas', label: 'Memória RAM', value: '', highlight: false },
      { category: 'tecnicas', label: 'Armazenamento', value: '', highlight: true },
      { category: 'tecnicas', label: 'Resolução Máxima', value: '4K', highlight: false }
    ],
    game: [
      { category: 'geral', label: 'Plataforma', value: '', highlight: true },
      { category: 'geral', label: 'Gênero', value: '', highlight: true },
      { category: 'geral', label: 'Classificação', value: '', highlight: false },
      { category: 'geral', label: 'Desenvolvedor', value: '', highlight: false },
      { category: 'geral', label: 'Data de Lançamento', value: '', highlight: false },
      { category: 'armazenamento', label: 'Idiomas', value: '', highlight: false },
      { category: 'online', label: 'Modos de Jogo', value: '', highlight: false },
      { category: 'armazenamento', label: 'Espaço Necessário', value: '', highlight: true },
      { category: 'online', label: 'Jogadores Online', value: '', highlight: false }
    ],
    accessory: [
      { category: 'geral', label: 'Tipo', value: '', highlight: true },
      { category: 'compatibilidade', label: 'Compatibilidade', value: '', highlight: true },
      { category: 'geral', label: 'Cor', value: '', highlight: false },
      { category: 'fisicas', label: 'Material', value: '', highlight: false },
      { category: 'tecnicas', label: 'Conectividade', value: '', highlight: false },
      { category: 'fisicas', label: 'Dimensões', value: '', highlight: false },
      { category: 'fisicas', label: 'Peso', value: '', highlight: false },
      { category: 'geral', label: 'Garantia', value: '1 ano', highlight: false }
    ]
  };

  const handleAddSpecification = () => {
    if (!newSpec.category || !newSpec.label || !newSpec.value) {
      return;
    }

    const currentSpecs = formData.specifications || [];
    const nextOrder = Math.max(0, ...currentSpecs.map(s => s.order)) + 1;

    const updatedSpecs = [
      ...currentSpecs,
      {
        ...newSpec,
        order: nextOrder
      }
    ];

    onChange('specifications', updatedSpecs);
    setNewSpec({
      category: '',
      label: '',
      value: '',
      highlight: false,
    });
  };

  const handleRemoveSpecification = (index: number) => {
    const currentSpecs = formData.specifications || [];
    const updatedSpecs = currentSpecs.filter((_, i) => i !== index);
    onChange('specifications', updatedSpecs);
  };

  const handleUpdateSpecification = (index: number, field: string, value: any) => {
    const currentSpecs = [...(formData.specifications || [])];
    currentSpecs[index] = {
      ...currentSpecs[index],
      [field]: value
    };
    onChange('specifications', currentSpecs);
  };

  const handleApplyTemplate = (templateKey: keyof typeof specTemplates) => {
    const template = specTemplates[templateKey];
    const currentSpecs = formData.specifications || [];
    const maxOrder = Math.max(0, ...currentSpecs.map(s => s.order));
    
    const newSpecs = template.map((spec, i) => ({
      ...spec,
      order: maxOrder + i + 1
    }));

    onChange('specifications', [...currentSpecs, ...newSpecs]);
  };

  // Agrupar especificações por categoria
  const groupedSpecs = (formData.specifications || []).reduce((acc, spec, index) => {
    if (!acc[spec.category]) {
      acc[spec.category] = [];
    }
    acc[spec.category].push({ ...spec, index });
    return acc;
  }, {} as Record<string, Array<any>>);

  return (
    <div className="space-y-6">
      {/* Templates rápidos */}
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

      {/* Adicionar nova especificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Especificação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Categoria</Label>
              <Select
                value={newSpec.category}
                onValueChange={(value) => setNewSpec(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {predefinedCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Nome</Label>
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
                placeholder="Ex: AMD Ryzen"
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
              onClick={handleAddSpecification}
              disabled={!newSpec.category || !newSpec.label || !newSpec.value}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Especificação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Especificações por categoria */}
      {Object.entries(groupedSpecs).map(([category, specs]) => (
        <Card key={category}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {predefinedCategories.find(cat => cat.value === category)?.label || category}
              </CardTitle>
              <Badge variant="outline">
                {specs.length} {specs.length === 1 ? 'item' : 'itens'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {specs.sort((a, b) => a.order - b.order).map((spec) => (
              <div key={spec.index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Input
                      value={spec.label}
                      onChange={(e) => handleUpdateSpecification(spec.index, 'label', e.target.value)}
                      placeholder="Nome da especificação"
                    />
                  </div>
                  <div>
                    <Input
                      value={spec.value}
                      onChange={(e) => handleUpdateSpecification(spec.index, 'value', e.target.value)}
                      placeholder="Valor"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={spec.highlight}
                    onCheckedChange={(checked) => handleUpdateSpecification(spec.index, 'highlight', checked)}
                  />
                  <Label className="text-xs">Destaque</Label>
                </div>

                {spec.highlight && (
                  <Star className="w-4 h-4 text-yellow-500" />
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveSpecification(spec.index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {(!formData.specifications || formData.specifications.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma especificação adicionada ainda.</p>
          <p className="text-sm">Use os templates acima ou adicione manualmente.</p>
        </div>
      )}
    </div>
  );
};

export default SpecificationsTab;