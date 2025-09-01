
import { useState, useCallback } from 'react';
import { Page } from '@/hooks/usePages';

export const useUIState = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);

  const handleEditPage = useCallback((page: Page) => {
    setSelectedPage(page);
    setIsEditing(true);
  }, []);

  const handleOpenLayout = useCallback((page: Page) => {
    setSelectedPage(page);
    setIsLayoutOpen(true);
  }, []);

  return {
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
  };
};
