
import { useState, useEffect, useCallback } from 'react';
import { Page } from '@/hooks/usePages';
import { PageFormData } from './types';

export const useFormState = (selectedPage: Page | null, isEditing: boolean, activeTab: 'list' | 'create') => {
  const [formData, setFormData] = useState<Partial<PageFormData>>({
    title: '',
    slug: '',
    description: '',
    isActive: true,
    theme: {
      primaryColor: '#107C10',
      secondaryColor: '#3A3A3A',
    },
    filters: {
      tagIds: [],
      categoryIds: []
    }
  });

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      isActive: true,
      theme: {
        primaryColor: '#107C10',
        secondaryColor: '#3A3A3A',
      },
      filters: {
        tagIds: [],
        categoryIds: []
      }
    });
  }, []);

  // Reset form when switching tabs or closing edit mode
  useEffect(() => {
    if (activeTab === 'create' || !isEditing) {
      resetForm();
    }
  }, [activeTab, isEditing, resetForm]);

  // Set form data when editing a page
  useEffect(() => {
    if (isEditing && selectedPage) {
      setFormData({
        title: selectedPage.title,
        slug: selectedPage.slug,
        description: selectedPage.description || '',
        isActive: selectedPage.isActive,
        theme: selectedPage.theme ? { ...selectedPage.theme } : {
          primaryColor: '#107C10',
          secondaryColor: '#3A3A3A',
        },
        filters: {
          tagIds: selectedPage.filters?.tagIds || [],
          categoryIds: selectedPage.filters?.categoryIds || []
        }
      });
    }
  }, [isEditing, selectedPage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSwitchChange = useCallback((checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  }, []);

  return {
    formData,
    handleInputChange,
    handleSwitchChange,
    resetForm
  };
};
