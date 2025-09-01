
export interface PrimePage {
  id: string;
  title: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PrimePageLayoutItem {
  id: string;
  page_id: string;
  section_type: string;
  section_key: string;
  display_order: number;
  is_visible: boolean;
  section_config: any;
  created_at: string;
  updated_at: string;
}
