
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProductTag {
  id: string;
  name: string;
}

interface ProductTagDisplayProps {
  tags: ProductTag[];
  maxVisible?: number;
}

export const ProductTagDisplay: React.FC<ProductTagDisplayProps> = ({
  tags,
  maxVisible = 3,
}) => {
  if (!tags || tags.length === 0) {
    return (
      <div className="text-xs text-gray-500">
        Sem categorias
      </div>
    );
  }

  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = Math.max(0, tags.length - maxVisible);

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="text-xs bg-red-100 text-red-700 hover:bg-red-200"
        >
          {tag.name}
        </Badge>
      ))}
      
      {remainingCount > 0 && (
        <Badge
          variant="outline"
          className="text-xs border-gray-400 text-gray-600"
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};
