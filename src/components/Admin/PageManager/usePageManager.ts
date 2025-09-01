
import { usePages } from '@/hooks/usePages';
import { useFormState } from './useFormState';
import { usePageOperations } from './usePageOperations';
import { useUIState } from './useUIState';

export const usePageManager = () => {
  const { 
    pages, 
    loading, 
    error, 
    createPage, 
    updatePage, 
    deletePage 
  } = usePages();
  
  const {
    activeTab,
    setActiveTab,
    selectedPage,
    setSelectedPage,
    isEditing,
    setIsEditing,
    isLayoutOpen,
    setIsLayoutOpen,
    handleEditPage,
    handleOpenLayout
  } = useUIState();

  const {
    formData,
    handleInputChange,
    handleSwitchChange
  } = useFormState(selectedPage, isEditing, activeTab);

  const {
    handleCreatePage,
    handleUpdatePage,
    handleDeletePage
  } = usePageOperations({
    createPage,
    updatePage,
    deletePage,
    formData,
    selectedPage,
    setActiveTab,
    setIsEditing,
    setSelectedPage
  });

  return {
    // State
    pages,
    loading,
    error,
    activeTab,
    selectedPage,
    isEditing,
    isLayoutOpen,
    formData,
    
    // Actions
    setActiveTab,
    setIsEditing,
    setIsLayoutOpen,
    handleInputChange,
    handleSwitchChange,
    handleCreatePage,
    handleUpdatePage,
    handleDeletePage,
    handleEditPage,
    handleOpenLayout
  };
};
