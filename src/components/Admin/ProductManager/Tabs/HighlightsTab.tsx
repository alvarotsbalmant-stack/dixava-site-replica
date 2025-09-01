import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Plus, X, Zap, Shield, Gamepad2, Cpu, Wifi, Volume2 } from 'lucide-react';
import { ProductFormData, ProductHighlight } from '@/types/product-extended';

interface HighlightsTabProps {
  formData: ProductFormData;
  onChange: (field: string, value: any) => void;
}

const HighlightsTab: React.FC<HighlightsTabProps> = ({ formData, onChange }) => {
  const [newHighlight, setNewHighlight] = useState({
    text: '',
    icon: 'star',
    is_featured: false
  });

  const iconOptions = [
    { value: 'star', label: 'Estrela', icon: Star },
    { value: 'zap', label: 'Raio', icon: Zap },
    { value: 'shield', label: 'Escudo', icon: Shield },
    { value: 'gamepad2', label: 'Controle', icon: Gamepad2 },
    { value: 'cpu', label: 'Processador', icon: Cpu },
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'volume2', label: 'Som', icon: Volume2 }
  ];

  const handleAddHighlight = () => {
    if (newHighlight.text.trim()) {
      const currentHighlights = formData.product_highlights || [];
      const highlightToAdd: ProductHighlight = {
        id: `highlight-${Date.now()}`,
        text: newHighlight.text.trim(),
        icon: newHighlight.icon,
        order: currentHighlights.length + 1,
        is_featured: newHighlight.is_featured
      };
      
      onChange('product_highlights', [...currentHighlights, highlightToAdd]);
      setNewHighlight({
        text: '',
        icon: 'star',
        is_featured: false
      });
    }
  };

  const handleRemoveHighlight = (highlightId: string) => {
    const currentHighlights = formData.product_highlights || [];
    const newHighlights = currentHighlights.filter(h => h.id !== highlightId);
    onChange('product_highlights', newHighlights);
  };

  const handleUpdateHighlight = (highlightId: string, field: string, value: any) => {
    const currentHighlights = formData.product_highlights || [];
    const newHighlights = currentHighlights.map(h => 
      h.id === highlightId ? { ...h, [field]: value } : h
    );
    onChange('product_highlights', newHighlights);
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    return iconOption ? iconOption.icon : Star;
  };

  return (
    <div className="space-y-6">
      {/* Adicionar Nova Característica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Adicionar Característica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="highlight_text">Texto da Característica</Label>
            <Input
              id="highlight_text"
              value={newHighlight.text}
              onChange={(e) => setNewHighlight(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Ex: Gráficos 4K Ultra HD"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="highlight_icon">Ícone</Label>
            <select
              id="highlight_icon"
              value={newHighlight.icon}
              onChange={(e) => setNewHighlight(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            >
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="highlight_featured"
              checked={newHighlight.is_featured}
              onCheckedChange={(checked) => setNewHighlight(prev => ({ ...prev, is_featured: checked as boolean }))}
            />
            <Label htmlFor="highlight_featured">Característica em destaque</Label>
          </div>

          <Button 
            onClick={handleAddHighlight} 
            disabled={!newHighlight.text.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Característica
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Características */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Características Configuradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.product_highlights && formData.product_highlights.length > 0 ? (
            <div className="space-y-3">
              {formData.product_highlights.map((highlight) => {
                const IconComponent = getIconComponent(highlight.icon);
                return (
                  <div key={highlight.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <Input
                            value={highlight.text}
                            onChange={(e) => handleUpdateHighlight(highlight.id, 'text', e.target.value)}
                            className="font-medium"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <select
                              value={highlight.icon}
                              onChange={(e) => handleUpdateHighlight(highlight.id, 'icon', e.target.value)}
                              className="text-xs px-2 py-1 border border-gray-300 rounded"
                            >
                              {iconOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            
                            <div className="flex items-center space-x-1">
                              <Checkbox
                                checked={highlight.is_featured}
                                onCheckedChange={(checked) => handleUpdateHighlight(highlight.id, 'is_featured', checked)}
                              />
                              <Label className="text-xs">Destaque</Label>
                            </div>
                            
                            {highlight.is_featured && (
                              <Badge className="text-xs bg-blue-600">
                                Destaque
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveHighlight(highlight.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma característica adicionada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview das Características */}
      {formData.product_highlights && formData.product_highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Preview das Características
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formData.product_highlights.map((highlight) => {
                const IconComponent = getIconComponent(highlight.icon);
                return (
                  <div 
                    key={highlight.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      highlight.is_featured ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      highlight.is_featured ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className={`font-medium ${
                      highlight.is_featured ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {highlight.text}
                    </span>
                    {highlight.is_featured && (
                      <Badge className="ml-auto bg-blue-600 text-xs">
                        Destaque
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HighlightsTab;

