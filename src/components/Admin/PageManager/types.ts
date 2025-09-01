
import { Page } from '@/hooks/usePages';

export interface PageFormData {
  title: string;
  slug: string;
  description: string;
  isActive: boolean;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  filters: {
    tagIds: string[];
    categoryIds: string[];
  };
}

export interface PageManagerState {
  activeTab: 'list' | 'create';
  selectedPage: Page | null;
  isEditing: boolean;
  isLayoutOpen: boolean;
  formData: Partial<Page>;
  hasChanges: boolean;
}
