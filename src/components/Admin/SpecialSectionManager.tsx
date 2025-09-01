import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { useSpecialSections } from '@/hooks/useSpecialSections';
import SpecialSectionList from './SpecialSectionManager/SpecialSectionList'; // Import the list component
import SpecialSectionForm from './SpecialSectionManager/SpecialSectionForm'; // Import the form component
// Use any for now to avoid type conflicts
type SpecialSection = any;
type SpecialSectionCreateInput = any;
type SpecialSectionUpdateInput = any;
import { Alert, AlertDescription } from '@/components/ui/alert';

const SpecialSectionManager = () => {
  const { sections, loading, createSection, updateSection, deleteSection, refetch } = useSpecialSections();
  const [showForm, setShowForm] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<SpecialSection | null>(null);

  const handleCreate = () => {
    setEditingSection(null);
    setShowForm(true);
  };

  const handleEdit = (section: SpecialSection) => {
    setEditingSection(section);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData: SpecialSectionCreateInput | SpecialSectionUpdateInput) => {
    try {
      if (editingSection) {
        // Ensure we only pass fields that exist in SpecialSectionUpdateInput
        // The form should ideally return the correct type
        await updateSection(editingSection.id, formData as SpecialSectionUpdateInput);
      } else {
        await createSection(formData as SpecialSectionCreateInput);
      }
      setShowForm(false);
      setEditingSection(null);
      // refetch(); // The hook already refetches on success
    } catch (error) {
      // Error is already handled by the hook's toast message
      console.error("Failed to save special section:", error);
    }
  };

  const handleDelete = async (id: string) => {
    // TODO: Add a nicer confirmation dialog (e.g., shadcn/ui AlertDialog)
    if (window.confirm('Tem certeza que deseja excluir esta seção especial? Esta ação não pode ser desfeita.')) {
      try {
        await deleteSection(id);
        // refetch(); // Hook refetches on success
      } catch (error) {
        console.error("Failed to delete special section:", error);
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSection(null);
  }

  if (showForm) {
    return (
      <SpecialSectionForm
        section={editingSection}
        onSubmit={handleFormSubmit}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <Card className="bg-[#2C2C44] border-[#343A40]">
      <CardHeader className="border-b border-[#343A40] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-6 h-6 text-[#007BFF]" />
              Gerenciamento de Seções Especiais
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              Crie e gerencie seções personalizadas com layouts complexos.
            </CardDescription>
            <Alert className="mt-3 bg-[#1A1A2E] border-[#343A40] text-gray-300">
              <Sparkles className="h-4 w-4 text-[#007BFF]" />
              <AlertDescription>
                Seções especiais permitem criar layouts únicos e personalizados para destacar conteúdo específico na página inicial.
              </AlertDescription>
            </Alert>
          </div>
          <Button onClick={handleCreate} className="bg-[#007BFF] hover:bg-[#0056B3] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Seção Especial
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <SpecialSectionList
          sections={sections as any}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default SpecialSectionManager;
