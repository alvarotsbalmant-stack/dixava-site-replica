
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { SpecialSectionElement } from '@/types/specialSections';

interface SpecialSectionElementListProps {
  elements: SpecialSectionElement[];
  onEdit: (element: SpecialSectionElement) => void;
  onDelete: (id: string) => void;
}

const SpecialSectionElementList: React.FC<SpecialSectionElementListProps> = ({
  elements,
  onEdit,
  onDelete
}) => {
  if (elements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>Nenhum elemento encontrado para esta seção.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {elements.map((element) => (
        <div key={element.id} className="border border-gray-600 rounded-md p-4 bg-gray-800">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="text-md font-medium text-gray-200 mb-2">
                {element.title || `Elemento ${element.element_type}`}
              </h4>
              <p className="text-sm text-gray-400 mb-2">
                Tipo: {element.element_type}
              </p>
              {element.subtitle && (
                <p className="text-sm text-gray-300">{element.subtitle}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit(element)}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => onDelete(element.id)}
                size="sm"
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpecialSectionElementList;
