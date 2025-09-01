import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewSpecialSectionManager from '@/components/Admin/SpecialSectionManager/NewSpecialSectionManager';

interface SpecialSectionEditorProps {
  open: boolean;
  onClose: () => void;
  section: any;
  onSectionUpdated?: (section: any) => void;
}

export const SpecialSectionEditor: React.FC<SpecialSectionEditorProps> = ({
  open,
  onClose,
  section,
  onSectionUpdated
}) => {
  if (!section) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Seção Especial</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <NewSpecialSectionManager sectionId={section.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};