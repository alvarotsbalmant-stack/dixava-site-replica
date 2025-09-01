import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Tag, X } from 'lucide-react';
import { ProductEditorData } from '../ProductEditor';
import { Tag as TagType } from '@/hooks/useTags';

interface TagsTabProps {
  formData: ProductEditorData;
  onChange: (field: string, value: any) => void;
  tags: TagType[];
}

const TagsTab: React.FC<TagsTabProps> = ({ formData, onChange, tags }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleTagToggle = (tagId: string) => {
    const currentTagIds = formData.tagIds || [];
    const updatedTagIds = currentTagIds.includes(tagId)
      ? currentTagIds.filter(id => id !== tagId)
      : [...currentTagIds, tagId];
    
    onChange('tagIds', updatedTagIds);
  };

  const clearAllTags = () => {
    onChange('tagIds', []);
  };

  const selectAllVisibleTags = () => {
    const visibleTags = tags.filter(tag =>
      tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const visibleTagIds = visibleTags.map(tag => tag.id);
    const currentTagIds = formData.tagIds || [];
    const allTagIds = [...new Set([...currentTagIds, ...visibleTagIds])];
    onChange('tagIds', allTagIds);
  };

  // Filter tags based on search
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group tags by category or create simple groups
  const groupedTags = filteredTags.reduce((acc, tag) => {
    // Simple categorization based on tag names
    let category = 'Outros';
    
    if (['xbox', 'playstation', 'nintendo', 'pc', 'steam'].some(platform => 
      tag.name.toLowerCase().includes(platform))) {
      category = 'Plataformas';
    } else if (['acao', 'aventura', 'rpg', 'esporte', 'corrida', 'tiro', 'estrategia'].some(genre => 
      tag.name.toLowerCase().includes(genre))) {
      category = 'Gêneros';
    } else if (['headset', 'controle', 'teclado', 'mouse', 'cabo'].some(accessory => 
      tag.name.toLowerCase().includes(accessory))) {
      category = 'Acessórios';
    } else if (['promocao', 'destaque', 'lancamento', 'oferta'].some(promo => 
      tag.name.toLowerCase().includes(promo))) {
      category = 'Promoções';
    }

    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, TagType[]>);

  const selectedTags = tags.filter(tag => (formData.tagIds || []).includes(tag.id));

  return (
    <div className="space-y-6">
      {/* Tags selecionadas */}
      {selectedTags.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags Selecionadas ({selectedTags.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllTags}
              >
                Limpar Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant="default"
                  className="flex items-center gap-1 pr-1"
                >
                  {tag.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTagToggle(tag.id)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca e seleção de tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Selecionar Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tags..."
                className="pl-10"
              />
            </div>
            {filteredTags.length > 0 && (
              <Button
                variant="outline"
                onClick={selectAllVisibleTags}
              >
                Selecionar Visíveis
              </Button>
            )}
          </div>

          {/* Tags agrupadas por categoria */}
          {Object.entries(groupedTags).map(([category, categoryTags]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-gray-900 text-sm">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {categoryTags.map(tag => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={(formData.tagIds || []).includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    />
                    <Label 
                      className="text-sm cursor-pointer flex-1"
                      onClick={() => handleTagToggle(tag.id)}
                    >
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredTags.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma tag encontrada para "{searchTerm}"</p>
            </div>
          )}

          {tags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Tag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma tag disponível</p>
              <p className="text-sm">Crie tags no painel de administração para organizá-las aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre tags */}
      <Card>
        <CardHeader>
          <CardTitle>Sobre as Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-500">💡</span>
              <div>
                <span className="font-medium">Organização:</span> Use tags para categorizar e organizar seus produtos. 
                Isso facilita a busca e a navegação dos clientes.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <span className="font-medium">SEO:</span> Tags relevantes ajudam na otimização para mecanismos de busca 
                e na descoberta de produtos relacionados.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500">⚡</span>
              <div>
                <span className="font-medium">Filtros:</span> Tags são usadas nos filtros da loja, 
                permitindo que os clientes encontrem produtos específicos rapidamente.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500">🎯</span>
              <div>
                <span className="font-medium">Recomendações:</span> O sistema usa tags para sugerir produtos relacionados 
                e criar seções personalizadas na loja.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TagsTab;