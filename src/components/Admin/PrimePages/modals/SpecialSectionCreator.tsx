import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SpecialSectionForm from '@/components/Admin/SpecialSectionManager/SpecialSectionForm';

interface SpecialSectionCreatorProps {
  open: boolean;
  onClose: () => void;
  pageId: string;
  onSectionCreated?: (section: any) => void;
}

export const SpecialSectionCreator: React.FC<SpecialSectionCreatorProps> = ({
  open,
  onClose,
  pageId,
  onSectionCreated
}) => {
  const handleSectionSave = async (sectionData: any) => {
    // Convert SpecialSection data to PrimePageLayoutItem format
    const layoutItem = {
      page_id: pageId,
      section_type: sectionData.type,
      section_key: sectionData.section_key || `special_${Date.now()}`,
      display_order: 999, // Will be adjusted by the parent
      is_visible: sectionData.visibility === 'active',
      section_config: {
        name: sectionData.title,
        title: sectionData.title,
        ...sectionData.config
      }
    };

    if (onSectionCreated) {
      onSectionCreated(layoutItem);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Seção Especial</DialogTitle>
        </DialogHeader>
        <SpecialSectionForm
          section={null}
          onSubmit={handleSectionSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};