
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tag } from '@/hooks/useTags';

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagChange: (tagId: string, checked: boolean) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTagIds,
  onTagChange,
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-white">
        Categorias (Tags)
      </Label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto p-3 bg-gray-700 rounded-lg border border-gray-600">
        {tags.length === 0 ? (
          <p className="text-gray-400 text-sm col-span-full text-center py-4">
            Nenhuma tag disponível. Crie tags primeiro no gerenciador de tags.
          </p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox
                id={`tag-${tag.id}`}
                checked={selectedTagIds.includes(tag.id)}
                onCheckedChange={(checked) => 
                  onTagChange(tag.id, checked as boolean)
                }
                className="border-gray-400"
              />
              <Label
                htmlFor={`tag-${tag.id}`}
                className="text-sm text-white cursor-pointer truncate"
                title={tag.name}
              >
                {tag.name}
              </Label>
            </div>
          ))
        )}
      </div>
      
      {selectedTagIds.length > 0 && (
        <p className="text-xs text-gray-400">
          {selectedTagIds.length} categoria(s) selecionada(s)
        </p>
      )}
    </div>
  );
};
