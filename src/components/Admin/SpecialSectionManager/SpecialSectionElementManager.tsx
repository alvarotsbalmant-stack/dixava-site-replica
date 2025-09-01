import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import SpecialSectionElementList from './SpecialSectionElementList';
import SpecialSectionElementForm from './SpecialSectionElementForm';
import { useSpecialSectionElements } from '@/hooks/useSpecialSectionElements';
import { SpecialSectionElement } from '@/types/specialSections';

interface SpecialSectionElementManagerProps {
  sectionId: string;
}

const SpecialSectionElementManager: React.FC<SpecialSectionElementManagerProps> = ({ sectionId }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<SpecialSectionElement | null>(null);

  const { elements, addElement, updateElement, deleteElement, loading, error } = useSpecialSectionElements(sectionId);

  const handleAddNew = () => {
    setEditingElement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (element: SpecialSectionElement) => {
    setEditingElement(element);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este elemento?')) {
      await deleteElement(id);
      // TODO: Add toast notification
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingElement) {
      await updateElement(editingElement.id, data);
    } else {
      await addElement({ ...data, special_section_id: sectionId });
    }
    setIsFormOpen(false);
    setEditingElement(null);
    // TODO: Add toast notification
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingElement(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-300">Gerenciar Elementos</h3>
        <Button onClick={handleAddNew} size="sm" className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Elemento
        </Button>
      </div>

      {loading && <p className="text-gray-400">Carregando elementos...</p>}
      {error && <p className="text-red-500">Erro ao carregar elementos: {error}</p>}

      {!loading && !error && (
        <SpecialSectionElementList
          elements={elements}
          onEdit={handleEdit}
          onDelete={handleDelete}
          // TODO: Add onReorder prop if implementing drag-and-drop
        />
      )}

      {isFormOpen && (
        <div className="mt-4 p-4 border border-gray-600 rounded-md bg-gray-850">
          <SpecialSectionElementForm
            element={editingElement}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
          />
        </div>
      )}
    </div>
  );
};

export default SpecialSectionElementManager;


