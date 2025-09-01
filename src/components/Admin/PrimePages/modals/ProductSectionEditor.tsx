import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SimpleProductSectionForm } from '../forms/SimpleProductSectionForm';

interface ProductSectionEditorProps {
  open: boolean;
  onClose: () => void;
  section: any;
  onSectionUpdated?: (section: any) => void;
}

export const ProductSectionEditor: React.FC<ProductSectionEditorProps> = ({
  open,
  onClose,
  section,
  onSectionUpdated
}) => {
  // Convert PrimePageLayoutItem to ProductSection format for editing
  const sectionData = section ? {
    id: section.id,
    title: section.section_config?.title || section.section_config?.name || '',
    section_key: section.section_key,
    view_all_link: section.section_config?.view_all_link || '',
    mode: section.section_config?.mode || 'manual',
    selectedProducts: section.section_config?.selectedProducts || [],
    criteria: section.section_config?.criteria || {},
    is_active: section.is_visible
  } : null;

  const handleSectionSave = async (updatedData: any) => {
    // Convert back to PrimePageLayoutItem format
    const updatedSection = {
      ...section,
      section_key: updatedData.section_key,
      is_visible: updatedData.is_active,
      section_config: {
        ...section.section_config,
        name: updatedData.title,
        title: updatedData.title,
        view_all_link: updatedData.view_all_link,
        mode: updatedData.mode,
        selectedProducts: updatedData.selectedProducts,
        criteria: updatedData.criteria
      }
    };

    if (onSectionUpdated) {
      onSectionUpdated(updatedSection);
    }
    onClose();
  };

  if (!section || !sectionData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Seção de Produtos</DialogTitle>
        </DialogHeader>
        <SimpleProductSectionForm
          section={sectionData}
          onSave={handleSectionSave}
          onCancel={onClose}
          mode="edit"
        />
      </DialogContent>
    </Dialog>
  );
};