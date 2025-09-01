import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Move, Trash2 } from 'lucide-react';
import { EmailBlock } from './EmailVisualEditor';

interface SortableEmailBlockProps {
  block: EmailBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const EmailBlockRenderer: React.FC<{ block: EmailBlock }> = ({ block }) => {
  switch (block.type) {
    case 'text':
      return (
        <div style={block.styles}>
          {block.content.text}
        </div>
      );
    case 'image':
      return (
        <div style={{ textAlign: block.styles.textAlign }}>
          <img 
            src={block.content.src} 
            alt={block.content.alt}
            style={{ maxWidth: block.styles.maxWidth, height: 'auto' }}
          />
        </div>
      );
    case 'button':
      return (
        <div style={{ textAlign: block.styles.textAlign }}>
          <span style={block.styles}>
            {block.content.text}
          </span>
        </div>
      );
    case 'spacer':
      return <div style={block.styles} />;
    case 'divider':
      return <div style={block.styles} />;
    default:
      return null;
  }
};

export const SortableEmailBlock: React.FC<SortableEmailBlockProps> = ({
  block,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative border-2 border-dashed rounded-lg p-3 cursor-pointer
        ${isSelected ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}
        ${isDragging ? 'shadow-lg opacity-50' : ''}
      `}
      onClick={onSelect}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 cursor-grab active:cursor-grabbing"
      >
        <Move className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="ml-6">
        <EmailBlockRenderer block={block} />
      </div>

      <Button
        size="sm"
        variant="destructive"
        className="absolute top-1 right-1 h-6 w-6 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
};