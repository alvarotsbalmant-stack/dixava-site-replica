
export interface ProductSection {
  id: string;
  title: string;
  title_part1?: string;
  title_part2?: string;
  title_color1?: string;
  title_color2?: string;
  view_all_link?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductSectionInput {
  title: string;
  title_part1?: string;
  title_part2?: string;
  title_color1?: string;
  title_color2?: string;
  view_all_link?: string;
  items: Array<{
    item_type: 'product' | 'banner';
    item_id: string;
    display_order: number;
  }>;
}
