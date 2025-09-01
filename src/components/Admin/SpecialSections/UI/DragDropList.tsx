import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Trash2, Edit } from 'lucide-react';

interface DragDropItem {
  id: string;
  title: string;
  type?: string;
  isVisible?: boolean;
  order?: number;
  [key: string]: any;
}

interface DragDropListProps {
  items: DragDropItem[];
  onReorder: (items: DragDropItem[]) => void;
  renderItem?: (item: DragDropItem) => React.ReactNode;
  keyExtractor?: (item: DragDropItem) => string;
}

export const DragDropList: React.FC<DragDropListProps> = ({
  items,
  onReorder,
  renderItem,
  keyExtractor
}) => {
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    onReorder(newItems);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    onReorder(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item) : item.id}>
          {renderItem ? (
            renderItem(item)
          ) : (
            <Card
              className={`transition-all ${!item.isVisible ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveDown(index)}
                      disabled={index === items.length - 1}
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
};

