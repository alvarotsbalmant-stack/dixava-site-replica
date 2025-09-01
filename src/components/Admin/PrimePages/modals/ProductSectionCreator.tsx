import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SimpleProductSectionForm } from '../forms/SimpleProductSectionForm';

interface ProductSectionCreatorProps {
  open: boolean;
  onClose: () => void;
  pageId: string;
  onSectionCreated?: (section: any) => void;
}

export const ProductSectionCreator: React.FC<ProductSectionCreatorProps> = ({
  open,
  onClose,
  pageId,
  onSectionCreated
}) => {
  const handleSectionSave = async (sectionData: any) => {
    // Convert ProductSection data to PrimePageLayoutItem format
    const layoutItem = {
      page_id: pageId,
      section_type: 'product_section',
      section_key: sectionData.section_key || `product_${Date.now()}`,
      display_order: 999, // Will be adjusted by the parent
      is_visible: true,
      section_config: {
        name: sectionData.title,
        title: sectionData.title,
        view_all_link: sectionData.view_all_link,
        mode: sectionData.mode || 'manual',
        selectedProducts: sectionData.selectedProducts || [],
        criteria: sectionData.criteria || {}
      }
    };

    if (onSectionCreated) {
      onSectionCreated(layoutItem);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Seção de Produtos</DialogTitle>
        </DialogHeader>
        <SimpleProductSectionForm
          onSave={handleSectionSave}
          onCancel={onClose}
          mode="create"
        />
      </DialogContent>
    </Dialog>
  );
};