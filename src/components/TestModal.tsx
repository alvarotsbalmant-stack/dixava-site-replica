import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface TestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TestModal: React.FC<TestModalProps> = ({
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-xl">
        <h2 className="text-2xl font-bold">Test Modal</h2>
        <p className="mt-4">This is a simple test modal to check if the dialog system is working.</p>
        <button onClick={() => onOpenChange(false)} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
      </DialogContent>
    </Dialog>
  );
};

export default TestModal;


