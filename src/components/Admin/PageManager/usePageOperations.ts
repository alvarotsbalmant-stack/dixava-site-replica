
import { useCallback } from 'react';
import { Page } from '@/hooks/usePages';
import { useToast } from '@/hooks/use-toast';
import { PageFormData } from './types';

interface UsePageOperationsProps {
  createPage: (pageData: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Page>;
  updatePage: (id: string, pageData: Partial<Omit<Page, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<Page | undefined>;
  deletePage: (id: string) => Promise<boolean>;
  formData: Partial<PageFormData>;
  selectedPage: Page | null;
  setActiveTab: (tab: 'list' | 'create') => void;
  setIsEditing: (editing: boolean) => void;
  setSelectedPage: (page: Page | null) => void;
}

export const usePageOperations = ({
  createPage,
  updatePage,
  deletePage,
  formData,
  selectedPage,
  setActiveTab,
  setIsEditing,
  setSelectedPage
}: UsePageOperationsProps) => {
  const { toast } = useToast();

  const handleCreatePage = useCallback(async () => {
    try {
      if (!formData.title || !formData.slug) {
        toast({
          title: "Campos obrigatórios",
          description: "Título e slug são obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      const normalizedSlug = formData.slug
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const newPage = await createPage({
        title: formData.title,
        slug: normalizedSlug,
        description: formData.description,
        isActive: formData.isActive ?? true,
        theme: formData.theme as Page['theme'],
        filters: {
          tagIds: formData.filters?.tagIds || [],
          categoryIds: formData.filters?.categoryIds || []
        }
      });

      toast({
        title: "Página criada",
        description: `A página "${newPage.title}" foi criada com sucesso.`
      });

      setActiveTab('list');
    } catch (err) {
      toast({
        title: "Erro ao criar página",
        description: "Ocorreu um erro ao criar a página. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [formData, createPage, toast, setActiveTab]);

  const handleUpdatePage = useCallback(async () => {
    if (!selectedPage) return;

    try {
      if (!formData.title || !formData.slug) {
        toast({
          title: "Campos obrigatórios",
          description: "Título e slug são obrigatórios.",
          variant: "destructive"
        });
        return;
      }

      const normalizedSlug = formData.slug
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      await updatePage(selectedPage.id, {
        title: formData.title,
        slug: normalizedSlug,
        description: formData.description,
        isActive: formData.isActive,
        theme: formData.theme,
        filters: {
          tagIds: formData.filters?.tagIds || [],
          categoryIds: formData.filters?.categoryIds || []
        }
      });

      toast({
        title: "Página atualizada",
        description: `A página "${formData.title}" foi atualizada com sucesso.`
      });

      setIsEditing(false);
      setSelectedPage(null);
    } catch (err) {
      toast({
        title: "Erro ao atualizar página",
        description: "Ocorreu um erro ao atualizar a página. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [selectedPage, formData, updatePage, toast, setIsEditing, setSelectedPage]);

  const handleDeletePage = useCallback(async (page: Page) => {
    try {
      await deletePage(page.id);
      
      toast({
        title: "Página excluída",
        description: `A página "${page.title}" foi excluída com sucesso.`
      });
      
      if (selectedPage?.id === page.id) {
        setSelectedPage(null);
        setIsEditing(false);
      }
    } catch (err) {
      toast({
        title: "Erro ao excluir página",
        description: "Ocorreu um erro ao excluir a página. Tente novamente.",
        variant: "destructive"
      });
    }
  }, [deletePage, toast, selectedPage, setSelectedPage, setIsEditing]);

  return {
    handleCreatePage,
    handleUpdatePage,
    handleDeletePage
  };
};
