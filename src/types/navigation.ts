export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  icon_url?: string | null;
  icon_type: 'image' | 'emoji' | 'icon';
  background_color: string | null;
  text_color: string | null;
  hover_background_color?: string | null;
  hover_text_color?: string | null;
  link_url: string;
  link_type: 'internal' | 'external';
  display_order: number;
  is_visible: boolean | null;
  is_active: boolean | null;
  // Configurações da linha de hover
  line_color?: string | null;
  line_height?: number | null;
  line_animation_duration?: number | null;
  show_line?: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface NavigationConfig {
  items: NavigationItem[];
  animation_duration: number; // em ms
  show_icons: boolean;
  responsive_breakpoint: number; // px
}

export interface CreateNavigationItemData {
  title: string;
  slug: string;
  icon_url?: string;
  icon_type: 'image' | 'emoji' | 'icon';
  background_color: string;
  text_color: string;
  hover_background_color?: string;
  hover_text_color?: string;
  link_url: string;
  link_type: 'internal' | 'external';
  display_order: number;
  is_visible?: boolean;
  is_active?: boolean;
  // Configurações da linha de hover
  line_color?: string;
  line_height?: number;
  line_animation_duration?: number;
  show_line?: boolean;
}

export interface UpdateNavigationItemData extends Partial<CreateNavigationItemData> {
  id: string;
}

export interface NavigationItemsResponse {
  data: NavigationItem[] | null;
  error: any;
}

export interface NavigationItemResponse {
  data: NavigationItem | null;
  error: any;
}

